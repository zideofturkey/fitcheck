const {
  hexaLogger,
  createConsumer,
  evaluateExpression,
  evaluateExpressionBool,
} = require("common");
const { createSessionManager } = require("sessionLayer");
const { ForbiddenError } = require("../../common");

const _getCookieOptions = require("common").getCookieOptions;

class SseController {
  constructor(name, routeName, req, res) {
    this.name = name;
    this.routeName = routeName;
    this.apiManager = null;
    this.crudType = "get";
    this.dataName = "resData";
    this._req = req;
    this._res = res;
    this.requestId = req.requestId;
    this.projectCodename = null;
    this.isMultiTenant = false;
    this.tenantName = "tenant";
    this.tenantId = "tenantId";
    this.sessionManager = null;
    this.responseMode = "stream";
    this.sseTimeout = 300000;
    this.chunkSize = 100;
    this.streamSourceConfig = null;
    this.kafkaProgressListeners = [];
  }

  async createApiManager() {}

  readM2MToken() {
    const request = this._req;
    if (!request || !request.headers) return null;
    const m2mToken =
      request.headers["x-m2m-token"] ||
      request.headers["X-M2M-Token"] ||
      request.headers["m2m-token"] ||
      request.headers["M2M-Token"];
    return m2mToken || null;
  }

  async init(options = {}) {
    if (this.isMultiTenant) this.readTenant();
    this.sessionToken = this.readSessionToken();
    this._req.sessionToken = this.sessionToken;

    const m2mToken = this.readM2MToken();
    if (m2mToken) {
      this._req.M2MToken = m2mToken;
    }

    if (this.isMultiTenant) {
      this._req[this.tenantName + "Codename"] =
        this[this.tenantName + "Codename"];
      this._req.tenantCodename = this[this.tenantName + "Codename"];
    }

    this.sessionManager = await createSessionManager(this._req);
    if (
      !options.skipSessionVerification &&
      !["/login", "/favicon.ico"].includes(this._req.path)
    )
      await this.sessionManager.verifySessionToken(this._req);
  }

  searchTenant() {
    const request = this._req;
    const tenantNameHeaderName = `mbx-${this.tenantName}-codename`;
    const _tenantName = `_${this.tenantName}`;

    let tenantCodename = request.headers[tenantNameHeaderName];
    if (tenantCodename) return tenantCodename;

    tenantCodename = request.body[_tenantName];
    if (tenantCodename) return tenantCodename;

    tenantCodename = request.query[_tenantName];
    if (tenantCodename) return tenantCodename;

    if (request.pathTenantCodename) return request.pathTenantCodename;

    return null;
  }

  readTenant() {
    const tenantCodename = `${this.tenantName}Codename`;
    this[tenantCodename] = this.searchTenant();
    if (!this[tenantCodename]) {
      this[tenantCodename] = "root";
    }
    this.tenantCodename = this[tenantCodename];
  }

  getBearerToken() {
    const request = this._req;
    const authorization =
      request.headers.authorization || request.headers.Authorization;
    if (authorization) {
      const authParts = authorization.split(" ");
      if (authParts.length === 2) {
        if (authParts[0] === "Bearer" || authParts[0] === "bearer") {
          const bearerToken = authParts[1];
          if (bearerToken && bearerToken !== "null") {
            return bearerToken;
          }
        }
      }
    }
    return null;
  }

  getCookieToken(cookieName) {
    const request = this._req;
    if (!request || !request.headers) return null;
    const cookieHeader = request.headers?.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const tokenCookie = cookies.find((cookie) =>
        cookie.startsWith(cookieName + "="),
      );
      if (tokenCookie) {
        return tokenCookie.split("=")[1];
      }
    }
  }

  readSessionToken() {
    const request = this._req;

    let sessionToken;
    sessionToken = request.query["access_token"];
    if (sessionToken) return sessionToken;

    sessionToken = this.getBearerToken();
    if (sessionToken) return sessionToken;

    if (this.isMultiTenant) {
      const headerName =
        this.projectCodename + "-access-token-" + this.tenantCodename;
      sessionToken =
        request.headers[headerName] ||
        request.headers[headerName.toLowerCase()];
      if (sessionToken) return sessionToken;
    } else {
      const headerName = this.projectCodename + "-access-token-";
      sessionToken =
        request.headers[headerName] ||
        request.headers[headerName.toLowerCase()];
      if (sessionToken) return sessionToken;
    }

    if (this.isMultiTenant) {
      let cookieName = `${this.projectCodename}-access-token-${this.tenantCodename}`;
      sessionToken = this.getCookieToken(cookieName, request);
      if (!sessionToken && this.tenantCodename === "root") {
        cookieName = `${this.projectCodename}-access-token`;
        sessionToken = this.getCookieToken(cookieName, request);
      }
      if (sessionToken) return sessionToken;
    } else {
      const cookieName = `${this.projectCodename}-access-token`;
      sessionToken = this.getCookieToken(cookieName, request);
      if (sessionToken) return sessionToken;
    }
    return null;
  }

  initSseHeaders() {
    this._res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    if (this._req.socket) this._req.socket.setNoDelay(true);
    this._res.flushHeaders();
  }

  sendSseEvent(eventName, data) {
    if (this._res.writableEnded) return;
    this._res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    if (this._res.flush) this._res.flush();
  }

  sendSseData(data) {
    if (this._res.writableEnded) return;
    this._res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (this._res.flush) this._res.flush();
  }

  endSseConnection() {
    if (!this._res.writableEnded) {
      this._res.end();
    }
  }

  async _logRequest() {
    hexaLogger.insertInfo(
      "SseRequestReceived",
      { function: this.name, requestType: "SSE" },
      `${this.routeName}.js->${this.name}`,
      {
        requestType: "SSE",
        method: this._req.method,
        url: this._req.url,
        body: this._req.body,
        query: this._req.query,
        params: this._req.params,
        headers: this._req.headers,
      },
      this.requestId,
    );
    console.group();
    console.log("    ");
    console.log(">>>");
    console.log(">>>");
    console.log("------------------------------------------------------------");
    console.log("SseRequestReceived", this._req.url, new Date().toISOString());
    console.log("------------------------------------------------------------");
    console.groupEnd();
  }

  async _logResponse() {
    hexaLogger.insertInfo(
      "SseRequestCompleted",
      { function: this.name, requestType: "SSE" },
      `${this.routeName}.js->${this.name}`,
      { requestType: "SSE" },
      this.requestId,
    );
    console.group();
    console.log("------------------------------------------------------------");
    console.log("SseRequestCompleted", this._req.url, new Date().toISOString());
    console.log("------------------------------------------------------------");
    console.groupEnd();
  }

  async _logError(err) {
    hexaLogger.insertError(
      "ErrorInSseRequest",
      { function: this.name, err: err.message },
      `${this.routeName}.js->${this.name}`,
      err,
      this.requestId,
    );
    console.group();
    console.error(
      "\x1b[31m",
      "------------------------------------------------------------",
    );
    console.error("ErrorInSseRequest", this._req.url, new Date().toISOString());
    console.error("ErrorMessage:", err.message);
    console.error(
      "------------------------------------------------------------",
      "\x1b[0m",
    );
    console.groupEnd();
  }

  async processRequest() {
    await this._logRequest();

    let timeoutHandle = null;
    let kafkaCleanup = null;

    try {
      await this.init();
      this.apiManager = await this.createApiManager(this._req);
      this.startTime = Date.now();

      this.initSseHeaders();

      timeoutHandle = setTimeout(() => {
        this.sendSseEvent("error", {
          message: "SSE connection timeout",
          code: "SSE_TIMEOUT",
        });
        if (kafkaCleanup) kafkaCleanup();
        this.endSseConnection();
      }, this.sseTimeout);

      this._req.on("close", () => {
        clearTimeout(timeoutHandle);
        if (kafkaCleanup) kafkaCleanup();
        if (this.apiManager?.abort) {
          this.apiManager.abort();
        }
      });

      const outputChannel = {
        write: (eventName, data) => this.sendSseEvent(eventName, data),
        send: (data) => this.sendSseData(data),
      };

      const streamOptions = {
        responseMode: this.responseMode,
        chunkSize: this.chunkSize,
        streamSourceConfig: this.streamSourceConfig,
      };

      const response = await this.apiManager.executeStreaming(
        outputChannel,
        streamOptions,
      );

      const hasKafkaListeners = this.kafkaProgressListeners?.length > 0;

      if (this.responseMode === "stream") {
        if (!hasKafkaListeners) {
          this.sendSseEvent("complete", {
            totalChunks: response?.totalChunks ?? 0,
            totalRows: response?.totalRows ?? 0,
            httpStatus: 200,
          });
        }
      } else {
        this.sendSseEvent("result", {
          ...(response ?? {}),
          httpStatus: 200,
        });
      }

      if (hasKafkaListeners && !this._res.writableEnded) {
        kafkaCleanup = await this._startKafkaListeners();
        if (this._res.writableEnded) {
          clearTimeout(timeoutHandle);
        }
      } else {
        clearTimeout(timeoutHandle);
        this.endSseConnection();
      }

      await this._logResponse();
      await this.apiManager.runAfterResponse();
    } catch (err) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (kafkaCleanup) kafkaCleanup();

      await this._logError(err);

      const statusCode = err.statusCode || err.status || 500;
      const errorPayload = {
        message: err.message,
        code: err.code || "SSE_ERROR",
        httpStatus: statusCode,
      };

      if (this._res.headersSent) {
        this.sendSseEvent("error", errorPayload);
        this.endSseConnection();
      } else {
        throw err;
      }
    }
  }

  _getPipelineContext() {
    if (!this.apiManager) return {};
    return {
      dbResult: this.apiManager.dbResult,
      data: this.apiManager.data,
      session: this.apiManager.session,
      variables: this.apiManager.variables,
    };
  }

  async _startKafkaListeners() {
    let consumers = [];
    let closed = false;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      for (const consumer of consumers) {
        try {
          consumer.disconnect();
        } catch (_) {
          /* ignore cleanup errors */
        }
      }
      consumers = [];
      this.endSseConnection();
    };

    try {
      for (const listener of this.kafkaProgressListeners) {
        const correlationValue = evaluateExpression(
          listener.correlationField,
          this._getPipelineContext(),
        );
        if (!correlationValue) continue;

        const consumer = createConsumer(
          listener.topic,
          `sse-progress-${this.requestId}`,
        );
        consumers.push(consumer);

        await consumer.connect();
        await consumer.subscribe({
          topics: [listener.topic],
          fromBeginning: false,
        });

        await consumer.run({
          eachMessage: async ({ message }) => {
            if (closed || this._res.writableEnded) return;

            try {
              const payload = JSON.parse(message.value.toString());
              const filterValue = payload[listener.kafkaFilterField];

              if (String(filterValue) !== String(correlationValue)) return;

              const eventData = listener.payloadMapping
                ? evaluateExpression(
                    listener.payloadMapping,
                    { msg: payload },
                    payload,
                  )
                : payload;

              this.sendSseEvent(listener.eventName, eventData);

              if (
                listener.completeWhen &&
                evaluateExpressionBool(listener.completeWhen, {
                  msg: payload,
                })
              ) {
                this.sendSseEvent("complete", {
                  message: "Kafka listener completed",
                });
                cleanup();
              }
            } catch (parseErr) {
              hexaLogger.insertError(
                "KafkaProgressParseError",
                { err: parseErr.message },
                `SseController._startKafkaListeners`,
                parseErr,
                this.requestId,
              );
            }
          },
        });
      }

      if (consumers.length === 0) {
        cleanup();
      }
    } catch (kafkaErr) {
      hexaLogger.insertError(
        "KafkaProgressConnectionError",
        { err: kafkaErr.message },
        `SseController._startKafkaListeners`,
        kafkaErr,
        this.requestId,
      );
      cleanup();
    }

    return cleanup;
  }
}

module.exports = SseController;

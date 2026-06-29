const { createHexCode } = require("common");
const { ForbiddenError, NotAuthenticatedError, ErrorCodes } = require("common");
const { hashString, hashCompare, validateM2MToken } = require("common");

class ApiManager {
  constructor(request, options) {
    this.request = request;
    this.name = options.name;
    this.controllerType = options.controllerType;
    this.requestId = request.requestId ?? createHexCode();
    this.appVersion = request.appVersion;
    this.caching = request.caching;
    this.cacheTTL = request.cacheTTL;
    this.getJoins = request.getJoins ? request.getJoins === "true" : true;
    this.excludeCqrs = request.excludeCqrs
      ? request.excludeCqrs === "true"
      : false;
    this.variables = {};
    this.redirectUrl = request.headers?.["x-redirect-url"];
    this.hasPagination = options.pagination;
    this.defaultPageRowCount = options.defaultPageRowCount;
    this.downloadName = request.downloadName ?? request.query?.downloadName;
    this.controllerType = options.controllerType;
    this.doCheckout = options.doCheckout;
    this.crudType = options.crudType;
    this.session = request.session;
    if (this.session) this.session.requestId = this.requestId;
    this.auth = request.auth;
    this.ROLES = this.auth?.ROLES ?? {};
    this.bodyParams = request.inputData ?? request.body;
    this.loginRequired = options.loginRequired;
    this.M2MAllowed = options.M2MAllowed;
    this.absoluteAuth = null;
  }

  async readParameters(request) {
    if (this.hasPagination) this.readPagination(request);

    switch (this.controllerType) {
      case "rest":
        this.readRestParameters(request);
        break;
      case "kafka":
        this.readKafkaParameters(request);
        break;
      case "grpc":
        this.readGrpcParameters(request);
        break;
      case "mcp":
        this.readMcpParameters(request);
        break;
      case "socket":
        this.readSocketParameters(request);
        break;
      case "sse":
        this.readSseParameters(request);
        break;
      case "cron":
        this.readCronParameters(request);
        break;
    }
  }

  readRestParameters(request) {}
  readKafkaParameters(request) {}
  readGrpcParameters(request) {}
  readMcpParameters(request) {}
  readSocketParameters(request) {}
  readSseParameters(request) {
    this.readRestParameters(request);
  }
  readCronParameters(request) {}
  async readRedisParameters() {}
  async transformParameters() {}
  readTenantId(request) {}

  readPagination(request) {
    this.pagination =
      request.pageNumber == 0
        ? null
        : {
            pageNumber: request.pageNumber ?? 1,
            pageRowCount: request.pageRowCount ?? this.defaultPageRowCount,
          };

    if (this.pagination) {
      if (isNaN(this.pagination.pageNumber)) {
        this.pagination.pageNumber = 1;
      }
      if (isNaN(this.pagination.pageRowCount)) {
        this.pagination.pageRowCount = 1;
      }

      this.pagination.pageNumber = parseInt(this.pagination.pageNumber);
      this.pagination.pageRowCount = parseInt(this.pagination.pageRowCount);
      if (this.pagination.pageNumber < 1) {
        this.pagination.pageNumber = 1;
      }
      if (this.pagination.pageRowCount < 1) {
        this.pagination.pageRowCount = 1;
      }
    }
  }

  #readFromObject(readParam, object) {
    if (readParam.includes(".")) {
      const readParams = readParam.split(".");
      let currentObject = object;
      for (const param of readParams) {
        if (!currentObject) return null;
        currentObject = currentObject[param];
      }
      return currentObject;
    }
    return object[readParam];
  }

  readFromContext(readParam) {
    return (
      this.#readFromObject(readParam, this) ??
      this.#readFromObject(readParam, this.variables)
    );
  }

  readFromSession(readParam) {
    return this.session ? this.#readFromObject(readParam, this.session) : null;
  }

  async checkValidLogin() {
    // Strategy 4: If M2MAllowed is false and loginRequired is false, no check needed
    if (!this.M2MAllowed && !this.loginRequired) {
      return;
    }

    // Strategy 1: If M2MAllowed and M2MToken exists, validate M2M token
    if (this.M2MAllowed && this.M2MToken) {
      const m2mPayload = await validateM2MToken(this.M2MToken);
      if (!m2mPayload) {
        throw new NotAuthenticatedError(
          `errMsg_${this.name}InvalidM2MToken`,
          ErrorCodes.InvalidM2MToken,
        );
      }
      // M2M token is valid, set M2M context and return
      this.m2mPayload = m2mPayload;
      return;
    }

    // Strategy 2: If M2MAllowed but no M2MToken
    if (this.M2MAllowed && !this.M2MToken) {
      // Strategy 2.1: If loginRequired is false, no auth needed — route is public
      if (!this.loginRequired) {
        return;
      }
      // Strategy 2.2: If loginRequired is true, check valid login (fall through)
    }

    // Strategy 3: If M2MAllowed is false and loginRequired is true, check valid login
    // Also handles Strategy 2.2: If M2MAllowed is true, no M2MToken, and loginRequired is true
    if (this.loginRequired) {
      if (!this.session || !this.session.sessionId) {
        throw new NotAuthenticatedError(
          `errMsg_${this.name}RequiresLogin`,
          ErrorCodes.LoginRequired,
        );
      }

      if (this.mobileVerificationNeeded && !this.session.mobileVerified) {
        throw new ForbiddenError(
          `errMsg_${this.name}RequiresMobileVerification`,
          ErrorCodes.MobileVerificationNeeded,
        );
      }

      if (this.emailVerificationNeeded && !this.session.emailVerified) {
        throw new ForbiddenError(
          `errMsg_${this.name}RequiresEmailVerification`,
          ErrorCodes.EmailVerificationNeeded,
        );
      }

      if (this.session.sessionNeedsEmail2FA) {
        throw new ForbiddenError(
          `errMsg_${this.name}RequiresEmail2FA`,
          ErrorCodes.EmailTwoFactorNeeded,
        );
      }

      if (this.session.sessionNeedsMobile2FA) {
        throw new ForbiddenError(
          `errMsg_${this.name}RequiresMobile2FA`,
          ErrorCodes.MobileTwoFactorNeeded,
        );
      }
    }
  }

  async checkParameters() {}
  async handleCheckout() {}
  async fetchInstance() {}
  async checkInstance() {}
  async addToOutput() {}
  async raiseEvent() {}

  async buildWhereClause() {}
  async buildDataClause() {}
  async getSelectList() {
    return [];
  }

  getWhereClause() {
    return this.whereClause;
  }

  getDataClause() {
    return this.dataClause;
  }

  setOwnership() {
    this.isOwner = false;
  }

  checkAbsolute() {
    return false;
  }

  toJSON() {
    const jsonObj = {
      id: this.id,
      requestId: this.requestId,
      appVersion: this.appVersion,
      caching: this.caching,
      cacheTTL: this.cacheTTL,
      getJoins: this.getJoins,
      excludeCqrs: this.excludeCqrs,
      redirectUrl: this.redirectUrl,
      controllerType: this.controllerType,
      pagination: this.pagination,
      paymentCallbackParams: this.paymentCallbackParams,
      paymentUserParams: this.paymentUserParams,
      urlPath: this.urlPath,
      urlWcPath: this.urlWcPath,
      pathName: this.pathName,
      filters: this.filters,
      requestData: this.requestData,
      session: this.session,
      bodyParams: this.bodyParams,
      ROLES: this.ROLES,
    };
    this.parametersToJson(jsonObj);
    return jsonObj;
  }

  parametersToJson(jsonObj) {
    // implement in subclasses
  }

  async checkBasicAuth() {
    return true;
  }

  async afterCheckValidLogin() {}
  async afterReadParameters() {}
  async afterTransformParameters() {}
  async afterCheckParameters() {}
  async afterCheckBasicAuth() {}
  async afterBuildWhereClause() {}
  async afterFetchInstance() {}
  async afterCheckInstance() {}
  async afterbuildDataClause() {}
  async afterMainGetOperation() {}
  async afterMainListOperation() {}
  async afterMainCreateOperation() {}
  async afterMainDeleteOperation() {}
  async afterMainUpdateOperation() {}
  async afterBuildOutput() {}
  async afterSendResponse() {}
  async afterApiEvent() {}

  getInstance() {
    return this._instance;
  }

  async execute() {
    this.startTime = Date.now();
    await this.checkValidLogin();
    await this.afterCheckValidLogin();

    await this.readParameters(this.request);
    await this.readRedisParameters();
    await this.afterReadParameters();

    await this.transformParameters();
    await this.afterTransformParameters();

    await this.checkParameters();
    await this.afterCheckParameters();

    // check basic roles and permissions
    await this.checkBasicAuth();
    await this.afterCheckBasicAuth();

    if (this.crudType != "create") {
      this.whereClause = await this.buildWhereClause();
      await this.afterBuildWhereClause();
    }

    if (["update", "delete"].includes(this.crudType)) {
      await this.fetchInstance();
      this.setOwnership();
      await this.afterFetchInstance();

      // check insatnce for activeCheck and ownerShip check options
      await this.checkInstance();
      await this.afterCheckInstance();
    }

    if (["update", "create"].includes(this.crudType)) {
      this.dataClause = await this.buildDataClause();
      await this.afterbuildDataClause();
    }

    await this.mainOperation();

    if (this.crudType == "create") {
      this.isOwner = true;
    }

    if (this.crudType == "get") {
      this.setOwnership();
      // check insatnce for activeCheck and ownerShip check options
      await this.checkInstance();
      await this.afterCheckInstance();
    }

    await this.runAfterMainOperation();

    await this.buildOutput();
    await this.afterBuildOutput();

    return this.output;
  }

  async executeStreaming(outputChannel, streamOptions = {}) {
    this._outputChannel = outputChannel;
    this._aborted = false;
    this._streamOptions = streamOptions;
    this.startTime = Date.now();

    const responseMode = streamOptions.responseMode ?? "stream";

    await this.checkValidLogin();
    if (responseMode === "events")
      await this.emitProgress("auth", "Authentication verified");
    await this.afterCheckValidLogin();

    await this.readParameters(this.request);
    await this.readRedisParameters();
    if (responseMode === "events")
      await this.emitProgress("params", "Parameters read");
    await this.afterReadParameters();

    await this.transformParameters();
    await this.afterTransformParameters();

    await this.checkParameters();
    if (responseMode === "events")
      await this.emitProgress("params", "Parameters validated");
    await this.afterCheckParameters();

    await this.checkBasicAuth();
    await this.afterCheckBasicAuth();

    if (this.crudType != "create") {
      this.whereClause = await this.buildWhereClause();
      await this.afterBuildWhereClause();
    }

    if (["update", "delete"].includes(this.crudType)) {
      await this.fetchInstance();
      this.setOwnership();
      await this.afterFetchInstance();

      await this.checkInstance();
      await this.afterCheckInstance();
    }

    if (["update", "create"].includes(this.crudType)) {
      this.dataClause = await this.buildDataClause();
      await this.afterbuildDataClause();
    }

    if (responseMode === "stream") {
      return await this._executeStreamMode(streamOptions);
    } else {
      return await this._executeEventsMode();
    }
  }

  async _executeStreamMode(streamOptions) {
    this._outputChannel.write("meta", {
      dataName: this.dataName,
      action: this.crudType,
      userId: this.session?._USERID,
      sessionId: this.session?.sessionId,
      requestId: this.requestId,
      appVersion: this.appVersion,
      chunkSize: streamOptions.chunkSize ?? 100,
    });

    let result;
    const streamSourceConfig = streamOptions.streamSourceConfig;

    if (streamSourceConfig && streamSourceConfig.sourceType) {
      const source = await this.createStreamSource(streamSourceConfig);
      result = await this._consumeStreamSource(source, streamOptions);
    } else if (this.crudType === "list") {
      result = await this._streamListResults(streamOptions);
    } else {
      await this.mainOperation();

      if (this.crudType == "create") this.isOwner = true;
      if (this.crudType == "get") {
        this.setOwnership();
        await this.checkInstance();
        await this.afterCheckInstance();
      }

      this._outputChannel.write("chunk", {
        index: 0,
        [this.dataName]: this.data,
        count: 1,
      });

      result = { totalChunks: 1, totalRows: 1 };
    }

    await this.runAfterMainOperation();

    this._streamOutput = {
      totalChunks: result.totalChunks,
      totalRows: result.totalRows,
    };
    await this.addToOutput();

    this.output = {
      status: "OK",
      statusCode: this.statusCode,
      elapsedMs: Date.now() - this.startTime,
      userId: this.session?._USERID,
      sessionId: this.session?.sessionId,
      requestId: this.requestId,
      dataName: this.dataName,
      method: this.httpMethod,
      action: this.crudType,
      appVersion: this.appVersion,
      totalChunks: result.totalChunks,
      totalRows: result.totalRows,
    };

    return this._streamOutput;
  }

  async _streamListResults(streamOptions) {
    const chunkSize = streamOptions.chunkSize ?? 100;
    let chunkIndex = 0;
    let totalRows = 0;
    let cursor = null;

    while (!this._aborted) {
      this.pagination = {
        pageRowCount: chunkSize,
        cursorMode: true,
        cursor: cursor,
      };

      await this.mainOperation();

      const items = this.dbResult?.items ?? [];
      if (items.length === 0) break;

      this._outputChannel.write("chunk", {
        index: chunkIndex,
        [this.dataName]: items,
        count: items.length,
      });

      totalRows += items.length;
      chunkIndex++;

      if (items.length < chunkSize) break;

      const lastItem = items[items.length - 1];
      cursor = {
        createdAt: lastItem.createdAt,
        id: lastItem.id,
      };
    }

    return { totalChunks: chunkIndex, totalRows };
  }

  async _consumeStreamSource(source, streamOptions) {
    let chunkIndex = 0;
    let totalRows = 0;

    if (source && (source[Symbol.asyncIterator] || source[Symbol.iterator])) {
      for await (const chunk of source) {
        if (this._aborted) break;

        const items = Array.isArray(chunk) ? chunk : [chunk];
        this._outputChannel.write("chunk", {
          index: chunkIndex,
          [this.dataName]: items.length === 1 ? items[0] : items,
          count: items.length,
        });

        totalRows += items.length;
        chunkIndex++;
      }
    }

    return { totalChunks: chunkIndex, totalRows };
  }

  async createStreamSource(config) {
    return null;
  }

  async *_createSseRelaySource(url, auth) {
    const http = url.startsWith("https") ? require("https") : require("http");
    const headers = { Accept: "text/event-stream" };
    if (auth) headers.Authorization = auth;

    const response = await new Promise((resolve, reject) => {
      const req = http.get(url, { headers }, resolve);
      req.on("error", reject);
    });

    let buffer = "";
    for await (const chunk of response) {
      if (this._aborted) break;
      buffer += chunk.toString();

      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);
        if (!block) continue;

        const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
        if (dataLine) {
          const raw = dataLine.slice(5).trim();
          try {
            yield JSON.parse(raw);
          } catch (_) {
            yield raw;
          }
        }
      }
    }
  }

  async *_createWsRelaySource(url, auth) {
    const WebSocket = require("ws");
    const headers = {};
    if (auth) headers.Authorization = auth;
    const ws = new WebSocket(url, { headers });

    const messages = [];
    let resolve = null;
    let done = false;

    ws.on("message", (data) => {
      const msg = data.toString();
      try {
        messages.push(JSON.parse(msg));
      } catch (_) {
        messages.push(msg);
      }
      if (resolve) {
        resolve();
        resolve = null;
      }
    });

    ws.on("close", () => {
      done = true;
      if (resolve) {
        resolve();
        resolve = null;
      }
    });

    ws.on("error", () => {
      done = true;
      if (resolve) {
        resolve();
        resolve = null;
      }
    });

    const onAbort = () => {
      ws.close();
    };

    try {
      await new Promise((r, j) => {
        ws.on("open", r);
        ws.on("error", j);
      });

      while (!done && !this._aborted) {
        if (messages.length === 0) {
          await new Promise((r) => {
            resolve = r;
          });
        }
        while (messages.length > 0) {
          yield messages.shift();
        }
      }
    } finally {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    }
  }

  async _executeEventsMode() {
    await this.emitProgress("mainOperation", "Starting main operation");
    await this.mainOperation();
    await this.emitProgress("mainOperation", "Main operation completed");

    if (this.crudType == "create") this.isOwner = true;
    if (this.crudType == "get") {
      this.setOwnership();
      await this.checkInstance();
      await this.afterCheckInstance();
    }

    await this.runAfterMainOperation();

    await this.emitProgress("buildOutput", "Building response");
    await this.buildOutput();
    await this.afterBuildOutput();

    return this.output;
  }

  async emitProgress(step, message, data = {}) {
    if (!this._outputChannel) return;
    this._outputChannel.write("progress", { step, message, ...data });
    await new Promise((r) => setTimeout(r, 10));
  }

  abort() {
    this._aborted = true;
  }

  async runAfterResponse() {
    await this.afterSendResponse();
    this.raiseEvent();
    await this.afterApiEvent();
  }

  async fetchJoinsToMainObject(data) {}

  async mainOperation() {
    this.dbResult = await this.executeMainOperation();
    this.result = this.dbResult; // alias: this.result === this.dbResult
    this[this.dataName] =
      this.crudType == "list" ? this.dbResult.items : this.dbResult;
    this.data = this[this.dataName];
    if (this[this.dataName]) {
      await this.fetchJoinsToMainObject(this[this.dataName]);
    }
  }

  async runAfterMainOperation() {
    const method = {
      get: "afterMainGetOperation",
      list: "afterMainListOperation",
      create: "afterMainCreateOperation",
      delete: "afterMainDeleteOperation",
      update: "afterMainUpdateOperation",
    }[this.crudType];
    if (this[method]) await this[method]();
  }

  async executeMainOperation() {}
  async addToResponse() {}
  async checkSessionInvalidates() {}

  async doCheckPermission(permissionName, objectId) {
    if (!this.auth) return false;
    return await this.auth.checkPermission(permissionName, objectId);
  }

  userHasRole(roleName) {
    if (!this.auth) return false;
    return this.auth.userHasRole(roleName);
  }

  async buildOutput() {
    const timeTaken = Date.now() - this.startTime;

    const source = this.dbResult._source;
    const cacheKey = this.dbResult._cacheKey;
    delete this.dbResult._source;
    delete this.dbResult._cacheKey;

    this.output = {
      status: "OK",
      statusCode: this.statusCode,
      elapsedMs: timeTaken,
      source: source,
      cacheKey: cacheKey,
      userId: this.session?._USERID,
      sessionId: this.session?.sessionId,
      requestId: this.requestId,
      dataName: this.dataName,
      method: this.httpMethod,
      action: this.crudType,
      appVersion: this.appVersion,
      rowCount: this.crudType == "list" ? this.dbResult.items.length : 1,
      [this.dataName]:
        this.crudType == "list" ? this.dbResult.items : this.dbResult,
      paging: this.crudType == "list" ? this.dbResult.paging : undefined,
      filters: this.crudType == "list" ? this.dbResult.filters : undefined,
      uiPermissions:
        this.crudType == "list" ? this.dbResult.uiPermissions : undefined,
      oldDataValues: this.crudType == "update" ? this.oldDataValues : undefined,
      newDataValues: this.crudType == "update" ? this.newDataValues : undefined,
      paymentResult: this.paymentResult ? this.paymentResult : undefined,
    };

    await this.addToOutput();
  }

  paymentUpdated(status) {}

  // utility functions to access from scripts
  hashString(strValue) {
    return hashString(strValue);
  }

  hashCompare(hash1, hash2) {
    return hashCompare(hash1, hash2);
  }

  getDbEventTopic(crudType) {
    const event = {
      create: "created",
      update: "updated",
      delete: "deleted",
    };

    return `${this.serviceCodename}-dbevent-${this.dataName.toLowerCase()}-${event[crudType]}`;
  }

  idList(itemArray, itemId) {
    if (!itemArray) itemArray = this[this.dataName];
    if (!itemId) itemId = "id";
    const arr = itemArray
      ? Array.isArray(itemArray)
        ? itemArray
        : [itemArray]
      : [];
    return arr.map((item) => item?.[itemId]).filter((id) => id != null); // removes null and undefined
  }
}

module.exports = ApiManager;

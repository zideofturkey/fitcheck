const { hexaLogger } = require("common");
const { createSessionManager } = require("sessionLayer");
const { ForbiddenError } = require("../../common");

const _getCookieOptions = require("common").getCookieOptions;

const LOG_PAYLOAD_BYTE_CAP = 4 * 1024;
const SENSITIVE_HEADER_RE =
  /^(authorization|cookie|set-cookie|.*token.*|.*api[-_]?key.*|.*secret.*)$/i;

function _safeHeaders(headers) {
  if (!headers || typeof headers !== "object") return undefined;
  const out = {};
  for (const k of Object.keys(headers)) {
    if (SENSITIVE_HEADER_RE.test(k)) continue;
    out[k] = headers[k];
  }
  return out;
}

function _truncatePayload(value) {
  if (value == null) return value;
  try {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    if (str.length <= LOG_PAYLOAD_BYTE_CAP) return value;
    return {
      _truncated: true,
      _originalLength: str.length,
      preview: str.slice(0, LOG_PAYLOAD_BYTE_CAP),
    };
  } catch (_) {
    return { _truncated: true, _unserializable: true };
  }
}

class RestController {
  constructor(name, routeName, req, res) {
    this.name = name;
    this.routeName = routeName;
    this.apiManager = null;
    this.response = {};
    this.businessOutput = null;
    this.crudType = "get";
    this.status = 200;
    this.dataName = "resData";
    this._req = req;
    this._res = res;
    this.requestId = req.requestId;
    this.redirectUrl = null;
    this.projectCodename = null;
    this.isMultiTenant = false;
    this.tenantName = "tenant";
    this.tenantId = "tenantId";
    this.sessionManager = null;
  }

  async createApiManager() {}

  readM2MToken() {
    // Extract M2M token from headers (not from authorization header)
    const request = this._req;
    if (!request || !request.headers) return null;

    // Check for M2M token in custom headers
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

    // Extract and set M2M token from headers
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

    if (this.isLoginApi) {
      if (
        this._req.session &&
        (this._req.userAuthUpdate || this._req.session.userAuthUpdate)
      ) {
        await this.sessionManager.relogin(this._req);
      }
    }
  }

  searchTenant() {
    const request = this._req;
    const tenantNameHeaderName = `mbx-${this.tenantName}-codename`;
    const _tenantName = `_${this.tenantName}`;

    // read tenant codename from header
    let tenantCodename = null;
    tenantCodename = request.headers[tenantNameHeaderName];
    if (!tenantCodename) {
      console.log(
        `Tenant codename not found in header: ${tenantNameHeaderName}`,
      );
    } else {
      console.log(
        `Tenant codename found in header: ${tenantNameHeaderName}`,
        tenantCodename,
      );
      return tenantCodename;
    }

    tenantCodename = request.body[_tenantName];
    if (!tenantCodename) {
      console.log(`Tenant codename not found in body: ${_tenantName}`);
    } else {
      console.log(
        `Tenant codename found in body: ${_tenantName}`,
        tenantCodename,
      );
      return tenantCodename;
    }

    tenantCodename = request.query[_tenantName];
    if (!tenantCodename) {
      console.log(`Tenant codename not found in query: ${_tenantName}`);
    } else {
      console.log(
        `Tenant codename found in query: ${_tenantName}`,
        tenantCodename,
      );
      return tenantCodename;
    }

    // If the codename is not set, try to read it from the url path if exists with $
    if (request.pathTenantCodename) {
      tenantCodename = request.pathTenantCodename;

      console.log(
        `Tenant codename set from path tenantCodename: ${tenantCodename}`,
        request.url,
      );
      return tenantCodename;
    } else {
      console.log("No tenant codename found in path");
    }
    return null;
  }

  readTenant() {
    // read tenantId or tenantCodename from the request
    console.log(
      "Reading tenant information from the rest request in rest controller",
    );

    const tenantCodename = `${this.tenantName}Codename`;

    this[tenantCodename] = this.searchTenant();

    if (!this[tenantCodename]) {
      this[tenantCodename] = "root";
      console.log("No tenant codename found, using default 'root'");
    }
    this.tenantCodename = this[tenantCodename];
    console.log("Final tenant codename:", this.tenantCodename);
  }

  getCookieToken(cookieName) {
    const request = this._req;
    if (!request || !request.headers) return null;
    const cookieHeader = request.headers?.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const tokenCookie = cookies.find((cookie) => {
        return cookie.startsWith(cookieName + "=");
      });

      if (tokenCookie) {
        return tokenCookie.split("=")[1];
      }
    }
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

  readSessionToken() {
    const request = this._req;

    let sessionToken;
    sessionToken = request.query["access_token"];
    if (sessionToken) {
      console.log("Token extracted:", "query", "access_token");
      return sessionToken;
    }

    sessionToken = this.getBearerToken();
    if (sessionToken) {
      console.log("Token extracted:", "bearer token");
      return sessionToken;
    }

    if (this.isMultiTenant) {
      // check if there is any header of the application
      const headerName =
        this.projectCodename + "-access-token-" + this.tenantCodename;
      sessionToken =
        request.headers[headerName] ||
        request.headers[headerName.toLowerCase()];
      if (sessionToken) {
        console.log("Tenant Token extracted:", "header", headerName);
        return sessionToken;
      }
    } else {
      // check if there is any header of the application
      const headerName = this.projectCodename + "-access-token-";
      sessionToken =
        request.headers[headerName] ||
        request.headers[headerName.toLowerCase()];
      if (sessionToken) {
        console.log("Token extracted:", "header", headerName);
        return sessionToken;
      }
    }

    if (this.isMultiTenant) {
      let cookieName = `${this.projectCodename}-access-token-${this.tenantCodename}`;
      sessionToken = this.getCookieToken(cookieName, request);
      if (!sessionToken && this.tenantCodename === "root") {
        // if tenantCodename is root, try to get the token from the default cookie name
        // this is useful for the root tenant to access the token without tenant codename
        cookieName = `${this.projectCodename}-access-token`;
        sessionToken = this.getCookieToken(cookieName, request);
      }
      if (sessionToken) {
        console.log("Tenant Token extracted:", "cookie", cookieName);
        this.currentCookieName = cookieName;
        return sessionToken;
      }
    } else {
      const cookieName = `${this.projectCodename}-access-token`;
      sessionToken = this.getCookieToken(cookieName, request);
      if (sessionToken) {
        console.log("Token extracted:", "cookie", cookieName);
        this.currentCookieName = cookieName;
        return sessionToken;
      }
    }
    return null;
  }

  setTokenInResponse() {
    const tokenName = this.isMultiTenant
      ? `${this.projectCodename}-access-token-${this.tenantCodename}`
      : `${this.projectCodename}-access-token`;
    if (this.sessionToken) {
      const cookieOptions = this.getCookieOptions();
      if (cookieOptions)
        this._res.cookie(tokenName, this.sessionToken, cookieOptions);
      else this.cookieError = "Unauthorized domain to set a cookie";

      this._res.set(tokenName, this.sessionToken);
    }
  }

  clearCookie() {
    const tokenName = this.isMultiTenant
      ? `${this.projectCodename}-access-token-${this[this.tenantCodename]}`
      : `${this.projectCodename}-access-token`;
    this._res.clearCookie(tokenName, this.getCookieOptions());
  }

  async redirect() {
    if (this.redirectUrl || this.apiManager.redirectUrl)
      return this._res.redirect(
        this.apiManager.redirectUrl ?? this.redirectUrl,
      );
    return false;
  }

  async doDownload() {
    const fileDownload = this.apiManager._fileDownload;
    if (!fileDownload) return false;

    const { filePath, filename, mimeType } = fileDownload;
    this._res.setHeader("Content-Type", mimeType || "application/octet-stream");
    this._res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    this._res.sendFile(filePath);
    return true;
  }

  async _logRequest() {
    if (process.env.LOG_REST_ENVELOPES !== "false") {
      hexaLogger.insertInfo(
        "RestRequestReceived",
        { function: this.name, requestType: "REST" },
        `${this.routeName}.js->${this.name}`,
        {
          requestType: "REST",
          method: this._req.method,
          url: this._req.url,
          body: _truncatePayload(this._req.body),
          query: this._req.query,
          params: this._req.params,
          headers: _safeHeaders(this._req.headers),
        },
        this.requestId,
      );
    }
    console.group();
    console.log("    ");
    console.log(">>>");
    console.log(">>>");
    console.log("------------------------------------------------------------");
    console.log("RestRequestReceived", this._req.url, new Date().toISOString());
    console.log("------------------------------------------------------------");
    console.groupEnd();
  }

  async _logResponse() {
    if (process.env.LOG_REST_ENVELOPES !== "false") {
      hexaLogger.insertInfo(
        "RestRequestResponded",
        { function: this.name, requestType: "REST" },
        `${this.routeName}.js->${this.name}`,
        {
          requestType: "REST",
          response: _truncatePayload(this.response),
        },
        this.requestId,
      );
    }
    console.group();
    console.log("------------------------------------------------------------");
    console.log(
      "RestRequestResponded",
      this._req.url,
      new Date().toISOString(),
    );
    console.log("------------------------------------------------------------");
    console.groupEnd();
  }

  async _logError(err) {
    hexaLogger.insertError(
      "ErrorInRestRequest",
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
    console.error(
      "ErrorInRestRequest",
      this._req.url,
      new Date().toISOString(),
    );
    console.error("ErrorMessage:", err.message);
    console.error(
      "------------------------------------------------------------",
      "\x1b[0m",
    );
    console.groupEnd();
  }

  getCookieOptions() {
    const ALLOWED = ["localhost", "127.0.0.1", process.env.SERVICE_BASE_URL];

    for (const cookieDomain of this.sessionManager.allowedCookieDomains ?? []) {
      ALLOWED.push(cookieDomain);
    }

    const cookieOpts = _getCookieOptions(this._req, ALLOWED);
    console.log("cookieOpts", cookieOpts);
    if (!cookieOpts) console.log("Unauthorized domain to set a cookie");

    return cookieOpts;
  }

  async processRequest() {
    await this._logRequest();

    try {
      await this.init();
      this.apiManager = await this.createApiManager(this._req);
      this.startTime = Date.now();
      this.response = await this.apiManager.execute();
      this.response.httpStatus = this.status;

      if (this.apiManager.setCookie) {
        // if any other explicit cookie is asked
        this._res.cookie(
          this.apiManager.setCookie.cookieName,
          this.apiManager.setCookie.cookieValue,
          this.getCookieOptions(),
        );
      }

      /*
      This code is removed, because cookie is already set (setTokenInResponse) from login route controllers
      if (this.isLoginApi) {
        this.sessionToken = this._req.sessionToken;
        this.setTokenInResponse();
      }
      */

      // Auto-login token support: if an action (e.g., autoLoginAfterRegister)
      // sets _autoLoginToken on the request, set the session cookie/header in the response.
      if (this._req.autoLoginToken) {
        this.sessionToken = this._req.autoLoginToken;
        this.setTokenInResponse();
        if (this.cookieError) {
          this.response.cookieError = this.cookieError;
        }
      }

      if (!(await this.redirect()) && !(await this.doDownload())) {
        // Re-assert the canonical create status. The subclass constructor
        // sets 201 for create, but if any post-action chain (e.g. a chained
        // updateCrudAction in workflow.create.afterMainCreateOperation) ever
        // mutates this.status to 200, we want the response to still reflect
        // "Created" semantics. Idempotent for non-create routes.
        if (this.crudType === "create" && this.status === 200) {
          this.status = 201;
        }
        this._res.status(this.status).send(this.response);
      }
      await this._logResponse();
      await this.apiManager.runAfterResponse();
    } catch (err) {
      await this._logError(err);
      throw err;
    }
  }
}

module.exports = RestController;

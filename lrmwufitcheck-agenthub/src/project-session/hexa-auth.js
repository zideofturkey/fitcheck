const { decodeJWT, validateJWT, validateJWT_RSA } = require("common");
const {
  getRestData,
  sendRestRequest,
  getRedisData,
  setRedisData,
  redisClient,
  ttlToHuman,
  checkKeyExists,
  getKeyTTL,
} = require("common");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { createJWT, createJWT_RSA } = require("common");

const { getPublicKey } = require("utils");
const {
  HttpServerError,
  ForbiddenError,
  BadRequestError,
  NotAuthenticatedError,
  ErrorCodes,
  NotFoundError,
} = require("common");

//
class HexaAuth {
  constructor() {
    this.isEmpty = true;
    this.accessToken = null;
    this.projectName = "mindbricks";
    this.projectCodename = "mindbricks";
    this.isJWT = true;
    this.isJWTAuthRSA = true;
    this.useRemoteSession = false;
    this.sessionUserIdProperty = "userId";
    this.superAdminId = "f7103b85-fcda-4dec-92c6-c336f71fd3a2";
    this.defaultDevUserId = "03d98dcb-1c24-4cca-88c6-0f80167c423a";
    this.rootTenantId = "d26f6763-ee90-4f97-bd8a-c69fabdb4780";
    this.adminGroupId = "3f3b0a4c-1d2e-4b8f-9a5c-7d6e0f1a2b3c";
    this.adminGroupMemberId = "4a5b6c7d-8e9f-0a1b-2c3d-72620f1b2a31";
    this.sessionReadLocation = "readFromSessionStore";
    this.cacheRemoteServiceResponse = false;
    this.remoteSessionWriteInStore = false;
    this.permissionManager = null;
    this.isMultiTenant = false;
    this.tenantName = null;
    this.tenantIdName = null;
    this.tenantCodename = null;
    this.tenantHeaderName = "mbx-tenant-id";

    this.useApiKeyAuth = false;
    this.apiKeyLocation = "bearer";
    this.secretApiKeyName = null;
    this.validateApiKeyUrl = null;
  }

  async getTenantIdByCodename(codename) {
    // This function should return the UUID for the given codename
    // In a real application, this could be a database lookup or a configuration file
    // return null if the route targets route tenant or app is not multi-tenant

    return null;
  }

  async checkPermission(permissionName, objectId = null) {
    if (!this.permissionManager) return false;
    return await this.permissionManager.checkPermissionForSession(
      permissionName,
      objectId,
    );
  }

  async checkObjectPermission(permissionName, objectId) {
    if (!this.permissionManager) return false;
    return await this.permissionManager.checkPermissionForSession(
      permissionName,
      objectId,
    );
  }

  async getPermissions(permissionName, objectId) {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getPermissions(
      permissionName,
      objectId,
    );
  }

  async getRootPermissions(permissionName) {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getRootPermissions(permissionName);
  }

  async getObjectPermissions(permissionName) {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getObjectPermissions(permissionName);
  }

  async getAllowedObjects(permissionName) {
    if (!this.permissionManager) return null;
    return await this.permissionManager.getAllowedObjects(permissionName);
  }

  async getPermissionFilter(permissionName) {
    if (!this.permissionManager) return null;
    return await this.permissionManager.getPermissionFilter(permissionName);
  }

  async getCurrentUserPermissions() {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getCurrentUserPermissions();
  }
  async getCurrentRolePermissions() {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getCurrentRolePermissions();
  }

  readFromContext(name) {
    return this[name];
  }

  readFromSession(name) {
    return this.session ? this.session[name] : null;
  }

  async hasSessionInEntityCache(sessionId) {
    const session = await getRedisData("hexasession:" + sessionId);
    return session ? true : false;
  }

  getUserSessionsKey(userId) {
    return `usersessions:${this.appCodename}:${
      this.isMultiTenant ? this.tenantCodename + ":" : ""
    }${userId}`;
  }

  getUserHistoryKey(userId) {
    return `userhistory:${this.appCodename}:${
      this.isMultiTenant ? this.tenantCodename + ":" : ""
    }${userId}`;
  }

  async writeSessionLastActivity(session, req) {
    const sessionKey = "hexasession:" + session.sessionId;

    // Check current TTL before updating
    const currentTTL = await redisClient.ttl(sessionKey);

    if (currentTTL === -2) {
      // Key doesn't exist - this shouldn't happen but log it for debugging
      console.log(
        `[Session] Warning: Session ${session.sessionId} no longer exists in Redis during activity update`,
      );
      return false;
    }

    if (currentTTL === -1) {
      // Key exists but has no TTL - this indicates a previous bug, let's fix it
      console.log(
        `[Session] Warning: Session ${session.sessionId} has no TTL, setting to 30 days`,
      );
      session.lastActiveAt = new Date().toISOString();
      session.lastActiveIp = req.clientIp;
      await setRedisData(sessionKey, session, 60 * 60 * 24 * 30);
      return true;
    }

    // Normal case: key exists with TTL
    session.lastActiveAt = new Date().toISOString();
    session.lastActiveIp = req.clientIp;
    const result = await setRedisData(sessionKey, session, "KEEPTTL");

    if (result === null) {
      console.log(
        `[Session] Warning: Failed to update session activity for ${session.sessionId}`,
      );
      return false;
    }

    return true;
  }

  async setSessionToEntityCache(session, days) {
    const sessionKey = "hexasession:" + session.sessionId;
    if (!days) days = 30;
    const ttlSeconds = 60 * 60 * 24 * days;

    const result = await setRedisData(sessionKey, session, ttlSeconds);

    // Verify the session was actually stored with correct TTL
    const verifyTTL = await redisClient.ttl(sessionKey);
    if (verifyTTL <= 0) {
      console.error(
        `[Session] CRITICAL: Session ${session.sessionId} was not stored properly! TTL: ${verifyTTL}, expected: ~${ttlSeconds}`,
      );
    } else {
      console.log(
        `[Session] Session ${session.sessionId} stored with TTL: ${verifyTTL}s (~${Math.round(verifyTTL / 86400)} days)`,
      );
    }

    const userSessionsKey = this.getUserSessionsKey(session._USERID);
    await redisClient.sAdd(userSessionsKey, [session.sessionId]);
  }

  async deleteUserSessions(userId) {
    if (!this.session) {
      throw new NotAuthenticatedError("Login not found");
    }

    let selfCall = false;
    if (!userId) {
      userId = this.session.userId;
      selfCall = true;
    }

    if (
      this.session.userId != userId &&
      ![
        "superAdmin",
        "admin",
        "saasAdmin",
        "tenantOwner",
        "tenantAdmin",
      ].includes(this.session.roleId)
    ) {
      throw new NotFoundError(
        "Only user themselves or admins can delete user sessions",
      );
    }

    const userSessionsKey = this.getUserSessionsKey(userId);

    const sessions = await redisClient.sMembers(userSessionsKey);
    if (selfCall) sessions.splice(sessions.indexOf(this.session.id), 1);

    if (!sessions.length) return false;

    for (const sessionId of sessions) {
      const sessionKey = "hexasession:" + sessionId;
      await redisClient.del(sessionKey);
      await redisClient.sRem(userSessionsKey, sessionId);
    }
    if (!selfCall) await redisClient.del(userSessionsKey);
    console.log("User Sessions Deleted for User:", userId);
    return true;
  }

  async deleteSessionFromEntityCache(session) {
    const sessionKey = "hexasession:" + session.sessionId;
    await redisClient.del(sessionKey);

    const userSessionsKey = this.getUserSessionsKey(session._USERID);
    await redisClient.sRem(userSessionsKey, session.sessionId);
  }

  async deleteUserSession(userId, sessionId) {
    // it is called by user or admin on client side, so make a check

    if (!this.session) {
      throw new NotAuthenticatedError("Login not found");
    }

    if (!userId) userId = this.session.userId;

    if (this.session.sessionId == sessionId) {
      throw new NotFoundError(
        "Active session can not be deleted, logout instead",
      );
    }

    if (
      this.session.userId != userId &&
      ![
        "superAdmin",
        "admin",
        "saasAdmin",
        "tenantOwner",
        "tenantAdmin",
      ].includes(this.session.roleId)
    ) {
      throw new NotFoundError(
        "Only user themselves or admins can delete a session",
      );
    }

    const sessionKey = "hexasession:" + sessionId;

    const session = await getRedisData(sessionKey);

    if (!session) {
      throw new NotFoundError("Session Not Found WithId:" + sessionId);
    }

    if (session.userId != userId) {
      throw new NotFoundError("User doesnt own this session:" + sessionId);
    }

    await redisClient.del(sessionKey);

    const userSessionsKey = this.getUserSessionsKey(userId);
    await redisClient.sRem(userSessionsKey, sessionId);
  }

  async getSessionFromEntityCache(sessionId) {
    const sessionKey = "hexasession:" + sessionId;
    const session = await getRedisData(sessionKey);

    if (!session) {
      // Additional debugging: check if key exists but is empty/corrupted
      const keyExists = await checkKeyExists(sessionKey);
      const keyTTL = await getKeyTTL(sessionKey);
      console.log(
        `[Session] Session NOT found in Redis:`,
        `key=${sessionKey}`,
        `exists=${keyExists}`,
        `ttl=${keyTTL}`,
        `(ttl -2 means key doesn't exist, -1 means no TTL set)`,
      );
      return null;
    }

    const ttl = await redisClient.ttl(sessionKey);
    console.log(
      `[Session] Session found in Redis:`,
      `key=${sessionKey}`,
      `userId=${session?._USERID || session?.userId}`,
      `ttl=${ttl}s (~${Math.round(ttl / 86400)} days)`,
    );

    session.expiresAt = ttlToHuman(ttl);

    return session;
  }

  async getUserSessions(userId) {
    if (!this.session) {
      throw new NotAuthenticatedError("Login not found");
    }

    if (!userId) userId = this.session.userId;

    if (
      this.session.userId != userId &&
      ![
        "superAdmin",
        "admin",
        "saasAdmin",
        "tenantOwner",
        "tenantAdmin",
      ].includes(this.session.roleId)
    ) {
      throw new NotFoundError(
        "Only user themselves or admins can list user sessions",
      );
    }

    const result = [];
    const userSessionsKey = this.getUserSessionsKey(userId);
    const sessions = await redisClient.sMembers(userSessionsKey);

    for (const sessionId of sessions) {
      const sessionKey = "hexasession:" + sessionId;
      const session = await getRedisData(sessionKey);
      if (!session) continue;
      delete session.password;
      delete session.userEventToken;
      session.expiresAt = ttlToHuman(await redisClient.ttl(sessionKey));
      if (session.sessionId == this.session.sessionId) {
        session.currentOne = true;
        result.unshift(session);
      } else {
        result.push(session);
      }
    }
    return result;
  }

  async getUserHistory(userId) {
    if (!this.session) {
      throw new NotAuthenticatedError("Login not found");
    }

    if (!userId) userId = this.session.userId;

    if (
      this.session.userId != userId &&
      ![
        "superAdmin",
        "admin",
        "saasAdmin",
        "tenantOwner",
        "tenantAdmin",
      ].includes(this.session.roleId)
    ) {
      throw new NotFoundError(
        "Only user themselves or admins can list user sessions",
      );
    }

    const userHistoryKey = this.getUserHistoryKey(userId);
    const history = ((await redisClient.sMembers(userHistoryKey)) ?? []).map(
      (h) => JSON.parse(h),
    );
    return history;
  }

  async checkNewSession(session) {
    // collect history other than this session
    const userHistoryKey = this.getUserHistoryKey(session.userId);
    const history = ((await redisClient.sMembers(userHistoryKey)) ?? []).map(
      (h) => JSON.parse(h),
    );

    if (!history.length) {
      await redisClient.sAdd(userHistoryKey, [
        JSON.stringify({
          id: session.id,
          ip: session.loginIp,
          city: session.city,
          country: session.country,
        }),
      ]);
      // this is the first session, so no need to check
      return null;
    }

    // check if this session is a new session by your strategy
    const ipList = history.map((s) => s.ip);
    const cityList = history.map((s) => s.city);
    const countryList = history.map((s) => s.country);

    const newIp =
      !ipList.includes(session.loginIp) && session.loginIp !== "$UNKNOWN";
    const newCity =
      !cityList.includes(session.city) && session.city !== "$UNKNOWN";
    const newCountry =
      !countryList.includes(session.country) && session.country !== "$UNKNOWN";

    // your strategey may be country sensitive, city sensitive or ip sensitive

    if (newIp) {
      await redisClient.sAdd(userHistoryKey, [
        JSON.stringify({
          id: session.id,
          ip: session.loginIp,
          city: session.city,
          country: session.country,
        }),
      ]);

      return {
        ip: session.loginIp,
        city: session.city,
        country: session.country,
        newCountry,
        newCity,
        newIp,
        strategy: "ipSensitive",
        message: "User logged in with a new ip",
      };
    }

    return null;
  }

  async getValidationCache(hash) {
    const tokenData = await getRedisData("tokenValidation:" + hash);
    return tokenData;
  }

  async setValidationCache(hash, tokenData) {
    const key = "tokenValidation:" + hash;
    await setRedisData(key, JSON.stringify(tokenData), 60 * 60 * 24);
  }

  async createPermissionManager() {
    // implement this in project auth if the project has PBAC
    // Create a permission manager specific to your project derived from HexaPermissionManager
  }

  async readTenantIdFromRequest(request) {
    this.tenantCodename = request.tenantCodename;

    if (this.tenantCodename === "root") {
      // If the tenant codename is "root", set the tenantId to rootTenantId
      this.tenantId = this.rootTenantId;
      console.log("Tenant codename is 'root', using root tenantId");
    } else if (this.tenantCodename) {
      // If the tenant codename is provided, fetch the tenantId by codename
      this.tenantId = await this.getTenantIdByCodename(
        request[this.tenantName + "Codename"],
      );
      if (!this.tenantId) {
        throw new BadRequestError("errMsg_noTenantRegisteredWithGivenCodeName");
      }
    }

    if (!this.tenantId) {
      // If the tenant ID is not set, use the root tenant ID
      this.tenantId = this.rootTenantId;
      this.tenantCodename = "root";
      console.log("No tenantId provided, using root tenantId");
    }

    this["_" + this.tenantIdName] = this.tenantId;
    this[this.tenantIdName] = this.tenantId;

    request[this.tenantIdName] = this.tenantId;

    console.log("Request made for tenantId:", this.tenantId);
  }

  async setServiceSession(request) {
    if (!this.session) {
      return {};
    }

    await this.createPermissionManager(this);
  }

  userHasRole(roleName) {
    // override this method with your role settings if the project has RBAC
    return false;
  }

  async createTokenFromSession(session, isTest) {
    const tokenMark = this.projectCodename + "-inapp-token";

    const payload = {
      tokenMark: tokenMark,
      keyId: global.currentKeyId,
      tokenName:
        this.projectCodename + (isTest ? "-test" : "-access") + "-token",
      sessionId: session.sessionId,
      userId: session._USERID,
      sub: session._USERID,
      loginDate: session.loginDate,
    };

    let token = null;

    const keysFolder = process.env.KEYS_FOLDER ?? "keys";
    const keyPath = path.join(
      __dirname,
      "../../",
      keysFolder,
      "rsa.key." + global.currentKeyId,
    );
    console.log("Key Path", keyPath);
    const privateKey = fs.existsSync(keyPath)
      ? fs.readFileSync(keyPath, "utf8")
      : null;

    if (privateKey) {
      const passphrase = process.env.RSA_PASS_PHRASE ?? "";
      try {
        token = await createJWT_RSA(
          payload,
          privateKey,
          passphrase,
          session.isAbsolute ? null : "30d",
        );
        console.log("Token created for session user", session._USERID);
        return token;
      } catch (e) {
        console.log("Error creating JWT token", e);
        throw new HttpServerError("errMsg_ErrorCreateingToken");
      }
    } else {
      throw new HttpServerError("errMsg_PrivateKeyNotFound");
    }
  }

  async verifyJWTAccessToken(token) {
    try {
      const tokenMark = this.projectCodename + "-inapp-token";
      const decoded = jwt.decode(token);
      if (!decoded) {
        return null;
      }

      if (decoded.tokenMark !== tokenMark) {
        // token is not a local app token,
        // return null for other authentication methods
        return null;
      }

      let tokenData = null;
      const keyId = decoded.keyId;

      const keysFolder = process.env.KEYS_FOLDER ?? "keys";

      const keyPath = path.join(
        __dirname,
        "../../" + keysFolder + "/rsa.key.pub." + keyId,
      );
      let publicKey = fs.existsSync(keyPath)
        ? fs.readFileSync(keyPath, "utf8")
        : null;

      if (!publicKey) {
        publicKey = await getPublicKey(keyId);
        if (
          publicKey &&
          publicKey.keyData &&
          publicKey.keyData.startsWith("-----BEGIN PUBLIC KEY-----")
        ) {
          publicKey = publicKey.keyData;
        }
      }

      if (publicKey) {
        tokenData = await validateJWT_RSA(token, publicKey);
        if (tokenData) {
          console.log("Token is verified with keyId", keyId);
        }
      } else {
        console.log(
          "token not verified, public key not found for keyId ",
          keyId,
        );
      }

      return tokenData;
    } catch (e) {
      console.log("Error verifying JWT token", e);
      return null;
    }
  }

  async verifySessionToken(req) {
    try {
      await this.readTenantIdFromRequest(req);
      await this.buildSessionFromRequest(req);
    } catch (err) {
      console.error("Error in verifySessionToken:", err);
      throw err;
    }

    if (!this.useRemoteSession) {
      // if the session is a local session, check it for invalidation
      if (this.session && this.session.userAuthUpdate) {
        throw new NotAuthenticatedError(
          "errMsg_UserAuthConfigUpdatedReloginNeeded",
        );
      }
    }
  }

  async setRemoteServiceVerificationRequest(accessToken) {
    // implement this in project auth if the project has remote service verification
    return {
      bearer: accessToken,
    };
  }

  async verifyAccessTokenByService(accessToken) {
    const remoteServiceVerificationRequest =
      await this.setRemoteServiceVerificationRequest(accessToken);

    const request = remoteServiceVerificationRequest;

    let requestHash = null;
    if (this.cacheRemoteServiceResponse) {
      requestHash = crypto
        .createHash("sha1")
        .update(JSON.stringify(request))
        .digest("hex");

      const verifiedDataCache = await this.getValidationCache(requestHash);
      if (verifiedDataCache) return verifiedDataCache;
    }

    const verifiedData = await sendRestRequest(
      request.verifyUrl,
      request.bearer,
      request.headers,
      request.cookies,
      request.body,
      request.query,
      request.method,
      null,
    );
    if (this.cacheRemoteServiceResponse) {
      await this.setValidationCache(requestHash, verifiedData);
    }
    return verifiedData;
  }

  async setRemoteSessionRequest() {
    return {};
  }

  async getRemoteSession(accessToken, tokenData) {
    const remoteSessionRequest = await this.setRemoteSessionRequest(
      accessToken,
      tokenData,
    );

    const request = remoteSessionRequest;

    if (this.remoteSessionWriteInStore) {
      const sessionId = tokenData?.sessionId;

      const remoteSession = sessionId
        ? await this.getSessionFromEntityCache(sessionId)
        : null;
      if (remoteSession) {
        return remoteSession;
      }
    }

    let remoteSession = await sendRestRequest(
      request.verifyUrl,
      request.bearer,
      request.headers,
      request.cookies,
      request.body,
      request.query,
      request.method,
      null,
    );

    remoteSession = this.normalizeRemoteSessionData(remoteSession);

    if (this.remoteSessionWriteInStore) {
      await this.setSessionToEntityCache(remoteSession, 1);
    }

    return remoteSession;
  }

  async normalizeRemoteSessionData(remoteSessionData) {
    return remoteSessionData;
  }

  async checkTenantMatch(session, req = null) {
    // Skip tenant mismatch check for public routes (loginRequired: false)
    if (req && req.loginRequired === false) {
      return;
    }

    const sessionTenantId = session[this.tenantIdName];
    const requestTenantId = this[this.tenantIdName];
    if (this.tenantIdName) {
      // Allow superAdmin to make requests to other tenants
      const isSuperAdmin = session.roleId === "superAdmin";
      if (!isSuperAdmin && sessionTenantId !== requestTenantId) {
        throw new ForbiddenError("errMsg_TenantMismatch");
      }
    }
  }

  extractApiKeyFromRequest(req) {
    if (!this.useApiKeyAuth) return null;

    if (this.apiKeyLocation === "bearer") {
      const token = req.sessionToken;
      if (token && typeof token === "string" && token.startsWith("sk_mbx_")) {
        return token;
      }
      return null;
    }

    const keyName = this.secretApiKeyName;
    if (!keyName) return null;

    switch (this.apiKeyLocation) {
      case "header":
        return (
          req.headers?.[keyName] || req.headers?.[keyName.toLowerCase()] || null
        );
      case "query":
        return req.query?.[keyName] || null;
      case "cookie":
        return req.cookies?.[keyName] || null;
      case "body":
        return req.body?.[keyName] || null;
      default:
        return null;
    }
  }

  async getApiKeySessionFromCache(keyHash) {
    const cacheKey = "apikeysession:" + keyHash;
    return await getRedisData(cacheKey);
  }

  async setApiKeySessionToCache(keyHash, session) {
    const cacheKey = "apikeysession:" + keyHash;
    await setRedisData(cacheKey, session, 60 * 60 * 24);
  }

  async getRemoteApiKeySession(apiKeyValue) {
    if (!this.validateApiKeyUrl) {
      console.log(
        "[ApiKey] No validateApiKeyUrl configured, cannot validate API key remotely",
      );
      return null;
    }

    try {
      const remoteSession = await sendRestRequest(
        this.validateApiKeyUrl,
        null,
        { "Content-Type": "application/json" },
        null,
        { apiKey: apiKeyValue },
        null,
        "POST",
        null,
      );
      return remoteSession;
    } catch (err) {
      console.log("[ApiKey] Remote API key validation failed:", err.message);
      return null;
    }
  }

  async handleApiKeyAuth(req) {
    const apiKeyValue = this.extractApiKeyFromRequest(req);
    if (!apiKeyValue) return false;

    const keyHash = crypto
      .createHash("sha256")
      .update(apiKeyValue)
      .digest("hex");

    const cachedSession = await this.getApiKeySessionFromCache(keyHash);
    if (cachedSession) {
      req.session = cachedSession;
      req.sessionId = cachedSession.sessionId;
      this.session = cachedSession;
      this.sessionId = cachedSession.sessionId;
      await this.setServiceSession(req);
      req.auth = this;
      return true;
    }

    let session = null;

    if (typeof this.setApiKeyLoginToRequest === "function") {
      await this.setApiKeyLoginToRequest(req, apiKeyValue);
      return !!req.session;
    }

    const remoteSession = await this.getRemoteApiKeySession(apiKeyValue);
    if (remoteSession) {
      session = remoteSession.session ?? remoteSession.data ?? remoteSession;

      await this.setApiKeySessionToCache(keyHash, session);

      req.session = session;
      req.sessionId = session.sessionId;
      this.session = session;
      this.sessionId = session.sessionId;
      await this.setServiceSession(req);
      req.auth = this;
      return true;
    }

    return false;
  }

  async buildSessionFromRequest(req) {
    if (this.useApiKeyAuth) {
      const apiKeyHandled = await this.handleApiKeyAuth(req);
      if (apiKeyHandled) return;
    }

    if (
      this.sessionReadLocation === "readFromRemoteService" &&
      !this.useRemoteSession
    )
      this.sessionReadLocation = "readFromSessionStore";

    const accessToken = await req.sessionToken;

    let tokenData = null;
    let validToken = true;

    if (this.isJWT && accessToken) {
      this.accessToken = accessToken;
      tokenData = await this.verifyJWTAccessToken(accessToken);
      if (!tokenData) validToken = false;
    }

    if (accessToken && validToken) {
      if (!tokenData && this.isRemoteAuth) {
        tokenData = await this.verifyAccessTokenByService(accessToken);
      }

      if (this.sessionReadLocation == "tokenIsSession") {
        req.session = tokenData;
        req.sessionId = tokenData.sessionId;
        this.session = req.session;
        this.sessionId = req.sessionId;
        await this.setServiceSession(req);
        req.auth = this;
      }

      if (this.sessionReadLocation == "readFromSessionStore") {
        const sessionId = tokenData.sessionId;
        const session = await this.getSessionFromEntityCache(sessionId);
        if (session) {
          req.session = session;
          req.sessionId = sessionId;
          this.session = req.session;
          this.sessionId = req.sessionId;
          await this.setServiceSession(req);
          req.auth = this;
          await this.writeSessionLastActivity(session, req);
        } else {
          console.log("Session not found in store for", sessionId);
        }
      }

      if (this.sessionReadLocation == "readFromRemoteService") {
        const remoteSession = await this.getRemoteSession(
          accessToken,
          tokenData,
        );
        if (remoteSession) {
          req.session = remoteSession;
          this.session = req.session;
          this.sessionId = remoteSession.sessionId;
          await this.setServiceSession(req);
          req.auth = this;
        }
      }

      if (req.session) {
        await this.checkTenantMatch(req.session, req);
      }

      if (req.session) return;

      // the request comes from an event with a user session attached
      if (req.internalSessionId) {
        console.log("Internal Session Id found ->", req.internalSessionId);
        const session = await this.getSessionFromEntityCache(
          req.internalSessionId,
        );
        if (session) {
          console.log("Session found in store", session.sessionId);
          req.session = session;
          req.sessionId = req.internalSessionId;
          this.session = req.session;
          this.sessionId = req.sessionId;
          await this.setServiceSession(req);
          req.auth = this;
        }
      }
    }
  }
}

module.exports = HexaAuth;

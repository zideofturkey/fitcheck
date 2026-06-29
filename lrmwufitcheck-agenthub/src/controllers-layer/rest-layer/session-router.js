const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const {
  HttpError,
  ForbiddenError,
  ErrorCodes,
  normalizeElasticSearchResult,
} = require("common");
const { ElasticIndexer } = require("serviceCommon");

const createServiceController = require("./create-service-controller");

const initWithRestController = async (name, routeName, req, res) => {
  const restController = createServiceController(name, routeName, req, res);
  await restController.init();
};

function enforce2FA(session) {
  if (!session) return;
  if (session.sessionNeedsEmail2FA) {
    throw new ForbiddenError(
      "errMsg_TwoFactorAuthenticationRequired",
      ErrorCodes.EmailTwoFactorNeeded,
    );
  }
  if (session.sessionNeedsMobile2FA) {
    throw new ForbiddenError(
      "errMsg_TwoFactorAuthenticationRequired",
      ErrorCodes.MobileTwoFactorNeeded,
    );
  }
}
const addSessionRoutes = () => {
  router.get("/currentuser", async (req, res) => {
    try {
      await initWithRestController("currentuser", "currentuser", req, res);
      if (req.session) {
        req.session.accessToken = req.auth.accessToken;
        res.status(200).send({ status: "OK", ...req.session });
      } else {
        res.status(401).json({ status: "ERR", message: "No login found" });
      }
    } catch (err) {
      //**errorLog
      res
        .status(err.statusCode ?? 500)
        .json({ status: "ERR", message: err.message });
    }
  });

  router.get("/publickey", (req, res, next) => {
    try {
      const fs = require("fs");
      const keyFolderName = process.env.KEYS_FOLDER ?? "keys";
      const keyId = req.query.keyId ?? global.currentKeyId;
      const keyPath = path.join(
        __dirname,
        "../../../" + keyFolderName + "/rsa.key.pub." + keyId,
      );
      console.log("loking for public key:", keyPath);

      const keyData = fs.existsSync(keyPath)
        ? fs.readFileSync(keyPath, "utf8")
        : null;
      if (!keyData) {
        return res
          .status(404)
          .json({ status: "ERR", message: "Public key not found" });
      }
      res.status(200).json({ status: "OK", keyId: keyId, keyData });
    } catch (err) {
      next(err);
    }
  });

  router.get("/permissions", async (req, res) => {
    try {
      await initWithRestController("permissions", "permissions", req, res);
      enforce2FA(req.session);
      if (req.auth) {
        console.log("asking for permissions of user:", req.session.userId);
        const pAll = await req.auth.getCurrentUserPermissions();
        res.status(200).send(pAll);
      } else {
        res.status(401).json({ status: "ERR", message: "No login found" });
      }
    } catch (err) {
      //**errorLog
      res.status(500).json({ status: "ERR", message: err.message });
    }
  });

  router.get("/rolepermissions", async (req, res) => {
    try {
      await initWithRestController(
        "rolepermissions",
        "rolepermissions",
        req,
        res,
      );
      enforce2FA(req.session);
      if (req.auth) {
        console.log("asking for permissions of role:", req.session.roleId);
        const pAll = await req.auth.getCurrentRolePermissions();
        res.status(200).send(pAll);
      } else {
        res.status(401).json({ status: "ERR", message: "No login found" });
      }
    } catch (err) {
      //**errorLog
      res.status(500).json({ status: "ERR", message: err.message });
    }
  });

  router.get("/permissions/:permissionName", async (req, res) => {
    try {
      await initWithRestController("onepermission", "onepermission", req, res);
      enforce2FA(req.session);
      const pName = req.params.permissionName;
      if (req.auth) {
        console.log("asking for permission filter of:", pName);
        const pFilter = await req.auth.getPermissionFilter(pName);
        res.status(200).send(pFilter);
      } else {
        res.status(401).json({ status: "ERR", message: "No login found" });
      }
    } catch (err) {
      //**errorLog
      res.status(500).json({ status: "ERR", message: err.message });
    }
  });

  router.post("/rawsearch/:index", async (req, res) => {
    try {
      await initWithRestController("realtimetoken", "realtimetoken", req, res);
      enforce2FA(req.session);

      if (!req.session) {
        res.status(401).json({ status: "ERR", message: "Login Required" });
        return;
      }

      if (
        ![
          "superAdmin",
          "admin",
          "saasAdmin",
          "tenantAdmin",
          "tenantOwner",
        ].includes(req.session.roleId)
      ) {
        //res.status(403).send("Admin role required");
        //return;
      }

      const elasticIndexer = new ElasticIndexer(req.params.index);

      const body = req.body;

      const fetchResponse = await elasticIndexer.makeRawSearch(body);
      if (!fetchResponse) fetchResponse = { items: [], aggreagtions: null };

      const fetchResult = normalizeElasticSearchResult(fetchResponse);

      res.setHeader("Content-Type", "application/json");
      res.status(200).send({ status: "OK", ...fetchResult });
    } catch (err) {
      //**errorLog
      res
        .status(err.statusCode ?? 500)
        .json({ status: "ERR", message: err.message });
    }
  });
};

const addLoginRoutes = () => {
  router.get("/login", (req, res) => {
    try {
      const filePath = path.join(__dirname, "login.html");
      let html = fs.readFileSync(filePath, "utf8");
      res.status(200).send(html);
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req, res, next) => {
    console.log("loginUserController", req.body);
    try {
      const restController = createServiceController(
        "login",
        "login",
        req,
        res,
      );
      await restController.init();

      const username = req.body.username ?? req.body.email ?? req.body.mobile;
      const password = req.body.password;
      const mobile = req.body.mobile;
      const sessionManager = restController.sessionManager;

      if (restController.isMultiTenant)
        await sessionManager.readTenantIdFromRequest(req);
      await sessionManager.setLoginToRequest(
        req,
        { username, password, mobile },
        null,
      );

      if (sessionManager.accessToken) {
        restController.sessionToken = restController._req.sessionToken;
        restController.setTokenInResponse();
      }

      res.status(200).send({
        status: "OK",
        ...(restController.cookieError
          ? {
              ...sessionManager.session,
              cookieError: restController.cookieError,
            }
          : sessionManager.session),
      });
    } catch (err) {
      //**errorLog
      console.error("Error in loginUserController:", err);
      return next(err);
    }
  });

  router.post("/validateapikey", async (req, res, next) => {
    try {
      const restController = createServiceController(
        "validateapikey",
        "validateapikey",
        req,
        res,
      );
      await restController.init();

      const sessionManager = restController.sessionManager;

      if (!sessionManager.setApiKeyLoginToRequest) {
        return res
          .status(404)
          .json({
            status: "ERR",
            message: "API Key authentication is not enabled",
          });
      }

      const apiKey = req.body.apiKey ?? req.headers["x-api-key"];
      if (!apiKey) {
        return res
          .status(400)
          .json({ status: "ERR", message: "apiKey is required" });
      }

      if (restController.isMultiTenant)
        await sessionManager.readTenantIdFromRequest(req);
      await sessionManager.setApiKeyLoginToRequest(req, apiKey);

      res.status(200).send({ status: "OK", ...sessionManager.session });
    } catch (err) {
      console.error("Error in validateapikey:", err);
      return next(err);
    }
  });

  router.get("/relogin", async (req, res, next) => {
    req.userAuthUpdate = true;

    const restController = createServiceController(
      "relogin",
      "relogin",
      req,
      res,
    );
    await restController.init();

    const sessionManager = restController.sessionManager;
    if (sessionManager.accessToken) {
      restController.sessionToken = restController._req.sessionToken;
      restController.setTokenInResponse();
    }

    if (req.session) {
      res.status(200).send({ status: "OK", ...req.session });
    } else {
      res.status(401).json({ status: "ERR", message: "Can not relogin" });
    }
  });

  router.get("/getusersessions", async (req, res, next) => {
    try {
      const restController = createServiceController(
        "getusersessions",
        "getusersessions",
        req,
        res,
      );
      await restController.init();
      enforce2FA(req.session);

      const sessionManager = restController.sessionManager;

      const userId = req.query.userId; // or leave null to get current user
      const sessions = await sessionManager.getUserSessions(userId);

      res.status(200).send(sessions);
    } catch (err) {
      next(err);
    }
  });

  router.get("/getuserhistory", async (req, res, next) => {
    try {
      const restController = createServiceController(
        "getusersessions",
        "getusersessions",
        req,
        res,
      );
      await restController.init();
      enforce2FA(req.session);

      const sessionManager = restController.sessionManager;

      const userId = req.query.userId; // or leave null to get current user
      const sessions = await sessionManager.getUserHistory(userId);

      res.status(200).send(sessions);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/deleteusersession/:sessionId", async (req, res, next) => {
    try {
      const restController = createServiceController(
        "deleteusersession",
        "deleteusersession",
        req,
        res,
      );
      await restController.init();
      enforce2FA(req.session);

      const sessionManager = restController.sessionManager;

      const sessionId = req.params.sessionId;
      const userId = req.query.userId; // or leave null to get current user
      await sessionManager.deleteUserSession(userId, sessionId);

      res.status(200).send({
        status: "OK",
        message: "Session deleted",
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/deleteallsessions", async (req, res, next) => {
    try {
      const restController = createServiceController(
        "deleteallsessions",
        "deleteallsessions",
        req,
        res,
      );
      await restController.init();
      enforce2FA(req.session);

      const sessionManager = restController.sessionManager;

      const userId = req.query.userId; // or leave null to get current user
      const deleted = await sessionManager.deleteUserSessions(userId);
      if (!deleted) {
        throw new NotFoundError(
          userId
            ? "errMsg_NoSessionsFoundForUser"
            : "errMsg_NoOtherSessionsFoundForUser",
        );
      }
      res.status(200).send({
        status: "OK",
        message: "User Sessions deleted, login again",
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      const restController = createServiceController(
        "logout",
        "logout",
        req,
        res,
      );
      await restController.init();

      const sessionManager = restController.sessionManager;

      console.log("logoutUserController", req.session?.userId);
      try {
        if (req.session) {
          console.log("deleting session from redis", req.session.sessionId);
          await sessionManager.deleteSessionFromEntityCache(req.session);
        }
      } catch (err) {
        //**errorLog
        console.log("Error while deleting session from redis", err.message);
      }

      // set cookie to be deleted
      restController.clearCookie();
    } catch (err) {
      //**errorLog
      console.log("Error while logging out", err.message);
    }
    res.status(200).send({
      status: "OK",
    });
  });
};

const getVerificationServicesRouter = () => {
  const verificationServicesRouter = require("../../verification-services");
  return verificationServicesRouter;
};

const getSessionRouter = () => {
  addSessionRoutes();
  return router;
};

const getLoginRouter = () => {
  addSessionRoutes();
  addLoginRoutes();
  return router;
};

module.exports = {
  getSessionRouter,
  getLoginRouter,
  getVerificationServicesRouter,
};

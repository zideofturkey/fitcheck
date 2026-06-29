const { GetUserManager } = require("apiLayer");

const AuthServiceSseController = require("../../AuthServiceSseController");

class GetUserSseController extends AuthServiceSseController {
  constructor(req, res) {
    super("getUser", "getuser", req, res);
    this.dataName = "user";
    this.crudType = "get";
    this.httpMethod = "GET";
    this.responseMode = "events";
    this.sseTimeout = 300000;
    this.chunkSize = 100;
  }

  createApiManager() {
    return new GetUserManager(this._req, "sse");
  }
}

const getUserSse = async (req, res, next) => {
  req.loginRequired = true;
  const controller = new GetUserSseController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getUserSse;

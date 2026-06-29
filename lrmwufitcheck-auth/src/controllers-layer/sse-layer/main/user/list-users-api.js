const { ListUsersManager } = require("apiLayer");

const AuthServiceSseController = require("../../AuthServiceSseController");

class ListUsersSseController extends AuthServiceSseController {
  constructor(req, res) {
    super("listUsers", "listusers", req, res);
    this.dataName = "users";
    this.crudType = "list";
    this.httpMethod = "GET";
    this.responseMode = "stream";
    this.sseTimeout = 300000;
    this.chunkSize = 5;
  }

  createApiManager() {
    return new ListUsersManager(this._req, "sse");
  }
}

const listUsersSse = async (req, res, next) => {
  req.loginRequired = true;
  const controller = new ListUsersSseController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listUsersSse;

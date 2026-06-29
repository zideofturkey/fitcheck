const { GetUserAvatarsFileManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class GetUserAvatarsFileRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("getUserAvatarsFile", "getuseravatarsfile", req, res);
    this.dataName = "userAvatarsFile";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetUserAvatarsFileManager(this._req, "rest");
  }
}

const getUserAvatarsFile = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetUserAvatarsFileRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getUserAvatarsFile;

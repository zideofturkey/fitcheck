const { ListUserAvatarsFilesManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class ListUserAvatarsFilesRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("listUserAvatarsFiles", "listuseravatarsfiles", req, res);
    this.dataName = "userAvatarsFiles";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListUserAvatarsFilesManager(this._req, "rest");
  }
}

const listUserAvatarsFiles = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListUserAvatarsFilesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listUserAvatarsFiles;

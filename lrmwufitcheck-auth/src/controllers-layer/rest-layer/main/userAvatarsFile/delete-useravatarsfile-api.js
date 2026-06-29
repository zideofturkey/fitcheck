const { DeleteUserAvatarsFileManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class DeleteUserAvatarsFileRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("deleteUserAvatarsFile", "deleteuseravatarsfile", req, res);
    this.dataName = "userAvatarsFile";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteUserAvatarsFileManager(this._req, "rest");
  }
}

const deleteUserAvatarsFile = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteUserAvatarsFileRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteUserAvatarsFile;

const { UpdateUserManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class UpdateUserRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("updateUser", "updateuser", req, res);
    this.dataName = "user";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateUserManager(this._req, "rest");
  }
}

const updateUser = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateUserRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateUser;

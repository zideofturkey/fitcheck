const { UpdateUserPasswordByAdminManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class UpdateUserPasswordByAdminRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("updateUserPasswordByAdmin", "updateuserpasswordbyadmin", req, res);
    this.dataName = "user";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateUserPasswordByAdminManager(this._req, "rest");
  }
}

const updateUserPasswordByAdmin = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateUserPasswordByAdminRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateUserPasswordByAdmin;

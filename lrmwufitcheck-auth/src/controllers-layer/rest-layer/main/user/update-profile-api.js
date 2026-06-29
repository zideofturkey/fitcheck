const { UpdateProfileManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class UpdateProfileRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("updateProfile", "updateprofile", req, res);
    this.dataName = "user";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateProfileManager(this._req, "rest");
  }
}

const updateProfile = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateProfileRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateProfile;

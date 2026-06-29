const { ArchiveProfileManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class ArchiveProfileRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("archiveProfile", "archiveprofile", req, res);
    this.dataName = "user";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new ArchiveProfileManager(this._req, "rest");
  }
}

const archiveProfile = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ArchiveProfileRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = archiveProfile;

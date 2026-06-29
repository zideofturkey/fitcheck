const { _fetchListUserAvatarsFileManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class _fetchListUserAvatarsFileRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("_fetchListUserAvatarsFile", "_fetchlistuseravatarsfile", req, res);
    this.dataName = "userAvatarsFiles";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListUserAvatarsFileManager(this._req, "rest");
  }
}

const _fetchListUserAvatarsFile = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListUserAvatarsFileRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListUserAvatarsFile;

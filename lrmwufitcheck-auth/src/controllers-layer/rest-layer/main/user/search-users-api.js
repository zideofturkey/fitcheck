const { SearchUsersManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class SearchUsersRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("searchUsers", "searchusers", req, res);
    this.dataName = "users";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new SearchUsersManager(this._req, "rest");
  }
}

const searchUsers = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new SearchUsersRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = searchUsers;

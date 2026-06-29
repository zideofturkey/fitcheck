const { ListUsersManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class ListUsersRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("listUsers", "listusers", req, res);
    this.dataName = "users";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListUsersManager(this._req, "rest");
  }
}

const listUsers = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListUsersRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listUsers;

const { CreateUserManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class CreateUserRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("createUser", "createuser", req, res);
    this.dataName = "user";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateUserManager(this._req, "rest");
  }
}

const createUser = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateUserRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createUser;

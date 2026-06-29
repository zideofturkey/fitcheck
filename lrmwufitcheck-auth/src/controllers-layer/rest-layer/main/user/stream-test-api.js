const { StreamTestManager } = require("apiLayer");

const AuthServiceRestController = require("../../AuthServiceRestController");

class StreamTestRestController extends AuthServiceRestController {
  constructor(req, res) {
    super("streamTest", "streamtest", req, res);
    this.dataName = "user";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new StreamTestManager(this._req, "rest");
  }
}

const streamTest = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new StreamTestRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = streamTest;

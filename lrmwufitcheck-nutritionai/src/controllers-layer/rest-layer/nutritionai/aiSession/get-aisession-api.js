const { GetAiSessionManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class GetAiSessionRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("getAiSession", "getaisession", req, res);
    this.dataName = "aiSession";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAiSessionManager(this._req, "rest");
  }
}

const getAiSession = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetAiSessionRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAiSession;

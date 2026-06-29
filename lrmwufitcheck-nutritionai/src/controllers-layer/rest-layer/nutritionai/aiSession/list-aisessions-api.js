const { ListAiSessionsManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class ListAiSessionsRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("listAiSessions", "listaisessions", req, res);
    this.dataName = "aiSessions";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAiSessionsManager(this._req, "rest");
  }
}

const listAiSessions = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAiSessionsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAiSessions;

const { _fetchListAiSessionManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class _fetchListAiSessionRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("_fetchListAiSession", "_fetchlistaisession", req, res);
    this.dataName = "aiSessions";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListAiSessionManager(this._req, "rest");
  }
}

const _fetchListAiSession = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListAiSessionRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListAiSession;

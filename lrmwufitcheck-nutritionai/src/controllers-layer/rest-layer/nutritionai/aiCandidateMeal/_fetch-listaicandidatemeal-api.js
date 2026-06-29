const { _fetchListAiCandidateMealManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class _fetchListAiCandidateMealRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("_fetchListAiCandidateMeal", "_fetchlistaicandidatemeal", req, res);
    this.dataName = "aiCandidateMeals";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListAiCandidateMealManager(this._req, "rest");
  }
}

const _fetchListAiCandidateMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListAiCandidateMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListAiCandidateMeal;

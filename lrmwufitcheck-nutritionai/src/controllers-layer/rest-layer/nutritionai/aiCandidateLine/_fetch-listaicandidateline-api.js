const { _fetchListAiCandidateLineManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class _fetchListAiCandidateLineRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("_fetchListAiCandidateLine", "_fetchlistaicandidateline", req, res);
    this.dataName = "aiCandidateLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListAiCandidateLineManager(this._req, "rest");
  }
}

const _fetchListAiCandidateLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListAiCandidateLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListAiCandidateLine;

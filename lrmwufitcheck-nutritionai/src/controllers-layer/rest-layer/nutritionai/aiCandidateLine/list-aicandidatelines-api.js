const { ListAiCandidateLinesManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class ListAiCandidateLinesRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("listAiCandidateLines", "listaicandidatelines", req, res);
    this.dataName = "aiCandidateLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAiCandidateLinesManager(this._req, "rest");
  }
}

const listAiCandidateLines = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAiCandidateLinesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAiCandidateLines;

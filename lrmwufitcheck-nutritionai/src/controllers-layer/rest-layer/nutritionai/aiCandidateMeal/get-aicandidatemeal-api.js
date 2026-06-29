const { GetAiCandidateMealManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class GetAiCandidateMealRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("getAiCandidateMeal", "getaicandidatemeal", req, res);
    this.dataName = "aiCandidateMeal";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAiCandidateMealManager(this._req, "rest");
  }
}

const getAiCandidateMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetAiCandidateMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAiCandidateMeal;

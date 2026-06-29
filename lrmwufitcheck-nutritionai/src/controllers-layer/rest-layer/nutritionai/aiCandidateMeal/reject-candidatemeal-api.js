const { RejectCandidateMealManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class RejectCandidateMealRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("rejectCandidateMeal", "rejectcandidatemeal", req, res);
    this.dataName = "aiCandidateMeal";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new RejectCandidateMealManager(this._req, "rest");
  }
}

const rejectCandidateMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new RejectCandidateMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = rejectCandidateMeal;

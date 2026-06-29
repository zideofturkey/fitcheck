const { ConfirmCandidateMealManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class ConfirmCandidateMealRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("confirmCandidateMeal", "confirmcandidatemeal", req, res);
    this.dataName = "aiCandidateMeal";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new ConfirmCandidateMealManager(this._req, "rest");
  }
}

const confirmCandidateMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ConfirmCandidateMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = confirmCandidateMeal;

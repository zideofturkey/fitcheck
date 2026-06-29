const { UpdateAiCandidateLineManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class UpdateAiCandidateLineRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("updateAiCandidateLine", "updateaicandidateline", req, res);
    this.dataName = "aiCandidateLine";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateAiCandidateLineManager(this._req, "rest");
  }
}

const updateAiCandidateLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateAiCandidateLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateAiCandidateLine;

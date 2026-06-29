const { GetAiGuidanceNoteManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class GetAiGuidanceNoteRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("getAiGuidanceNote", "getaiguidancenote", req, res);
    this.dataName = "aiGuidanceNote";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAiGuidanceNoteManager(this._req, "rest");
  }
}

const getAiGuidanceNote = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetAiGuidanceNoteRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAiGuidanceNote;

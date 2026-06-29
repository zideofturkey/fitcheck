const { _fetchListAiGuidanceNoteManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class _fetchListAiGuidanceNoteRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("_fetchListAiGuidanceNote", "_fetchlistaiguidancenote", req, res);
    this.dataName = "aiGuidanceNotes";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListAiGuidanceNoteManager(this._req, "rest");
  }
}

const _fetchListAiGuidanceNote = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListAiGuidanceNoteRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListAiGuidanceNote;

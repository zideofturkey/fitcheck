const { ListAiGuidanceNotesManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class ListAiGuidanceNotesRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("listAiGuidanceNotes", "listaiguidancenotes", req, res);
    this.dataName = "aiGuidanceNotes";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAiGuidanceNotesManager(this._req, "rest");
  }
}

const listAiGuidanceNotes = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAiGuidanceNotesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAiGuidanceNotes;

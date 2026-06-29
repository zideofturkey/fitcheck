const { AskNutritionQuestionManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class AskNutritionQuestionRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("askNutritionQuestion", "asknutritionquestion", req, res);
    this.dataName = "aiSession";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new AskNutritionQuestionManager(this._req, "rest");
  }
}

const askNutritionQuestion = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new AskNutritionQuestionRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = askNutritionQuestion;

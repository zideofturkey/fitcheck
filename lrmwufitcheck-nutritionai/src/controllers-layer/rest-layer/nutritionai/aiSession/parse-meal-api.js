const { ParseMealManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class ParseMealRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("parseMeal", "parsemeal", req, res);
    this.dataName = "aiSession";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new ParseMealManager(this._req, "rest");
  }
}

const parseMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ParseMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = parseMeal;

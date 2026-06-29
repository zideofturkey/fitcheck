const { ListAiCandidateMealsManager } = require("apiLayer");

const NutritionAiServiceRestController = require("../../NutritionAiServiceRestController");

class ListAiCandidateMealsRestController extends NutritionAiServiceRestController {
  constructor(req, res) {
    super("listAiCandidateMeals", "listaicandidatemeals", req, res);
    this.dataName = "aiCandidateMeals";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAiCandidateMealsManager(this._req, "rest");
  }
}

const listAiCandidateMeals = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAiCandidateMealsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAiCandidateMeals;

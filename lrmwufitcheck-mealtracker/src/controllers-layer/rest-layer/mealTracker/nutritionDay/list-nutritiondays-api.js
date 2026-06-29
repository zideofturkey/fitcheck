const { ListNutritionDaysManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class ListNutritionDaysRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("listNutritionDays", "listnutritiondays", req, res);
    this.dataName = "nutritionDays";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListNutritionDaysManager(this._req, "rest");
  }
}

const listNutritionDays = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListNutritionDaysRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listNutritionDays;

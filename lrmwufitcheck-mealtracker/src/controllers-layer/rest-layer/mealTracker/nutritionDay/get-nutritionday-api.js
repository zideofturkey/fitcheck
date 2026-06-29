const { GetNutritionDayManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class GetNutritionDayRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("getNutritionDay", "getnutritionday", req, res);
    this.dataName = "nutritionDay";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetNutritionDayManager(this._req, "rest");
  }
}

const getNutritionDay = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetNutritionDayRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getNutritionDay;

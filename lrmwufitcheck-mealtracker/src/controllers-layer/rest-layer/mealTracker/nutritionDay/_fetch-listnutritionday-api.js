const { _fetchListNutritionDayManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class _fetchListNutritionDayRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("_fetchListNutritionDay", "_fetchlistnutritionday", req, res);
    this.dataName = "nutritionDays";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListNutritionDayManager(this._req, "rest");
  }
}

const _fetchListNutritionDay = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListNutritionDayRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListNutritionDay;

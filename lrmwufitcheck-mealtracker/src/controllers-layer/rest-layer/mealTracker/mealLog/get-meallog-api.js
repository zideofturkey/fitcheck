const { GetMealLogManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class GetMealLogRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("getMealLog", "getmeallog", req, res);
    this.dataName = "mealLog";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetMealLogManager(this._req, "rest");
  }
}

const getMealLog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetMealLogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getMealLog;

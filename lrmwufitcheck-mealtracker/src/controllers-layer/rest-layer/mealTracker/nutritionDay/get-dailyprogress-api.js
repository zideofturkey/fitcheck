const { GetDailyProgressManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class GetDailyProgressRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("getDailyProgress", "getdailyprogress", req, res);
    this.dataName = "nutritionDay";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetDailyProgressManager(this._req, "rest");
  }
}

const getDailyProgress = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetDailyProgressRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getDailyProgress;

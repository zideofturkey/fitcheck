const { GetWeeklyAnalyticsManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class GetWeeklyAnalyticsRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("getWeeklyAnalytics", "getweeklyanalytics", req, res);
    this.dataName = "nutritionDays";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetWeeklyAnalyticsManager(this._req, "rest");
  }
}

const getWeeklyAnalytics = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetWeeklyAnalyticsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getWeeklyAnalytics;

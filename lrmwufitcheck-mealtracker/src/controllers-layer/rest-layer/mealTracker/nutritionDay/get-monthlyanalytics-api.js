const { GetMonthlyAnalyticsManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class GetMonthlyAnalyticsRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("getMonthlyAnalytics", "getmonthlyanalytics", req, res);
    this.dataName = "nutritionDays";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetMonthlyAnalyticsManager(this._req, "rest");
  }
}

const getMonthlyAnalytics = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetMonthlyAnalyticsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getMonthlyAnalytics;

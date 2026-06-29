const { _fetchListMealLogManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class _fetchListMealLogRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("_fetchListMealLog", "_fetchlistmeallog", req, res);
    this.dataName = "mealLogs";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListMealLogManager(this._req, "rest");
  }
}

const _fetchListMealLog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListMealLogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListMealLog;

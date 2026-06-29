const { ListMealLogsManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class ListMealLogsRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("listMealLogs", "listmeallogs", req, res);
    this.dataName = "mealLogs";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListMealLogsManager(this._req, "rest");
  }
}

const listMealLogs = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListMealLogsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listMealLogs;

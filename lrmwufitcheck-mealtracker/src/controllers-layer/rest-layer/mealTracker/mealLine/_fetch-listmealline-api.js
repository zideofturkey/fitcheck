const { _fetchListMealLineManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class _fetchListMealLineRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("_fetchListMealLine", "_fetchlistmealline", req, res);
    this.dataName = "mealLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListMealLineManager(this._req, "rest");
  }
}

const _fetchListMealLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListMealLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListMealLine;

const { ListMealLinesManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class ListMealLinesRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("listMealLines", "listmeallines", req, res);
    this.dataName = "mealLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListMealLinesManager(this._req, "rest");
  }
}

const listMealLines = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListMealLinesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listMealLines;

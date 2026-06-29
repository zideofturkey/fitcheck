const { DeleteMealLineManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class DeleteMealLineRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("deleteMealLine", "deletemealline", req, res);
    this.dataName = "mealLine";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteMealLineManager(this._req, "rest");
  }
}

const deleteMealLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteMealLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteMealLine;

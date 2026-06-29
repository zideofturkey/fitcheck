const { DeleteMealLogManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class DeleteMealLogRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("deleteMealLog", "deletemeallog", req, res);
    this.dataName = "mealLog";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteMealLogManager(this._req, "rest");
  }
}

const deleteMealLog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteMealLogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteMealLog;

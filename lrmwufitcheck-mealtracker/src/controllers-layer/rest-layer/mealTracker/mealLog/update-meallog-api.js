const { UpdateMealLogManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class UpdateMealLogRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("updateMealLog", "updatemeallog", req, res);
    this.dataName = "mealLog";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateMealLogManager(this._req, "rest");
  }
}

const updateMealLog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateMealLogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateMealLog;

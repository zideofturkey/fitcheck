const { CreateMealLogManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class CreateMealLogRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("createMealLog", "createmeallog", req, res);
    this.dataName = "mealLog";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateMealLogManager(this._req, "rest");
  }
}

const createMealLog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateMealLogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createMealLog;

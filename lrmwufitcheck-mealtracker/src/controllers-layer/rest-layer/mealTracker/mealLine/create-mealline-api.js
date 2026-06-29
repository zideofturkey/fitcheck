const { CreateMealLineManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class CreateMealLineRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("createMealLine", "createmealline", req, res);
    this.dataName = "mealLine";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateMealLineManager(this._req, "rest");
  }
}

const createMealLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateMealLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createMealLine;

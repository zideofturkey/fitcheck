const { UpdateMealLineManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class UpdateMealLineRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("updateMealLine", "updatemealline", req, res);
    this.dataName = "mealLine";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateMealLineManager(this._req, "rest");
  }
}

const updateMealLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateMealLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateMealLine;

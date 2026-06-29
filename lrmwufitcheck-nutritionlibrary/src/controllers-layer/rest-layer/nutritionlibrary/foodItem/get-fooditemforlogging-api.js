const { GetFoodItemForLoggingManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetFoodItemForLoggingRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getFoodItemForLogging", "getfooditemforlogging", req, res);
    this.dataName = "foodItem";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetFoodItemForLoggingManager(this._req, "rest");
  }
}

const getFoodItemForLogging = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetFoodItemForLoggingRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getFoodItemForLogging;

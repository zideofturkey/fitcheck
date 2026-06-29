const { GetFoodItemManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetFoodItemRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getFoodItem", "getfooditem", req, res);
    this.dataName = "foodItem";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetFoodItemManager(this._req, "rest");
  }
}

const getFoodItem = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetFoodItemRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getFoodItem;

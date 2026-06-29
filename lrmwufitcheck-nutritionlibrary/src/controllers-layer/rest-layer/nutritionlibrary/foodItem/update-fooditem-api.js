const { UpdateFoodItemManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class UpdateFoodItemRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("updateFoodItem", "updatefooditem", req, res);
    this.dataName = "foodItem";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateFoodItemManager(this._req, "rest");
  }
}

const updateFoodItem = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateFoodItemRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateFoodItem;

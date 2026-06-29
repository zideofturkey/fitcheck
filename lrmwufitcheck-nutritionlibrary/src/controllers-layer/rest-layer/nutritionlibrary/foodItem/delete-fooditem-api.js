const { DeleteFoodItemManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class DeleteFoodItemRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("deleteFoodItem", "deletefooditem", req, res);
    this.dataName = "foodItem";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteFoodItemManager(this._req, "rest");
  }
}

const deleteFoodItem = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteFoodItemRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteFoodItem;

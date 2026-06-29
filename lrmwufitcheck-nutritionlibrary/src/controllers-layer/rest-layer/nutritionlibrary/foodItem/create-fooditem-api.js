const { CreateFoodItemManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class CreateFoodItemRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("createFoodItem", "createfooditem", req, res);
    this.dataName = "foodItem";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateFoodItemManager(this._req, "rest");
  }
}

const createFoodItem = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateFoodItemRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createFoodItem;

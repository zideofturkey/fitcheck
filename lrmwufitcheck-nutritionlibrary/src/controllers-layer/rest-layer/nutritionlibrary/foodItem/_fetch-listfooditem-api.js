const { _fetchListFoodItemManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class _fetchListFoodItemRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("_fetchListFoodItem", "_fetchlistfooditem", req, res);
    this.dataName = "foodItems";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListFoodItemManager(this._req, "rest");
  }
}

const _fetchListFoodItem = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListFoodItemRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListFoodItem;

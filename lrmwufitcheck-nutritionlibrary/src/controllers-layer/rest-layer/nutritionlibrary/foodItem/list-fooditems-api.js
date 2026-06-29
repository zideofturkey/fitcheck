const { ListFoodItemsManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class ListFoodItemsRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("listFoodItems", "listfooditems", req, res);
    this.dataName = "foodItems";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListFoodItemsManager(this._req, "rest");
  }
}

const listFoodItems = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListFoodItemsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listFoodItems;

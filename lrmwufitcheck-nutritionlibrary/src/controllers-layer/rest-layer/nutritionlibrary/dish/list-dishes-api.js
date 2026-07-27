const { ListDishesManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class ListDishesRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("listDishes", "listdishes", req, res);
    this.dataName = "dishes";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListDishesManager(this._req, "rest");
  }
}

const listDishes = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListDishesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listDishes;

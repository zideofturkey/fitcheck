const { CreateDishManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class CreateDishRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("createDish", "createdish", req, res);
    this.dataName = "dish";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateDishManager(this._req, "rest");
  }
}

const createDish = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateDishRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createDish;

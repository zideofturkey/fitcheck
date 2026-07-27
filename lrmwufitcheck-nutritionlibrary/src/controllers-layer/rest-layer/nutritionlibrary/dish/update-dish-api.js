const { UpdateDishManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class UpdateDishRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("updateDish", "updatedish", req, res);
    this.dataName = "dish";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateDishManager(this._req, "rest");
  }
}

const updateDish = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateDishRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateDish;

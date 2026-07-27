const { DeleteDishManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class DeleteDishRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("deleteDish", "deletedish", req, res);
    this.dataName = "dish";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteDishManager(this._req, "rest");
  }
}

const deleteDish = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteDishRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteDish;

const { DeleteDishLineManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class DeleteDishLineRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("deleteDishLine", "deletedishline", req, res);
    this.dataName = "dishLine";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteDishLineManager(this._req, "rest");
  }
}

const deleteDishLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteDishLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteDishLine;

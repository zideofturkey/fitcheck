const { AddDishLineManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class AddDishLineRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("addDishLine", "adddishline", req, res);
    this.dataName = "dishLine";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new AddDishLineManager(this._req, "rest");
  }
}

const addDishLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new AddDishLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = addDishLine;

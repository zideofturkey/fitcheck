const { GetDishManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetDishRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getDish", "getdish", req, res);
    this.dataName = "dish";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetDishManager(this._req, "rest");
  }
}

const getDish = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetDishRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getDish;

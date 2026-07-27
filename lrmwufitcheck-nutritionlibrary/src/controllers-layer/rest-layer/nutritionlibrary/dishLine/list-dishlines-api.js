const { ListDishLinesManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class ListDishLinesRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("listDishLines", "listdishlines", req, res);
    this.dataName = "dishLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListDishLinesManager(this._req, "rest");
  }
}

const listDishLines = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListDishLinesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listDishLines;

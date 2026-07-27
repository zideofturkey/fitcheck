const { _fetchListDishLineManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class _fetchListDishLineRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("_fetchListDishLine", "_fetchlistdishline", req, res);
    this.dataName = "dishLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListDishLineManager(this._req, "rest");
  }
}

const _fetchListDishLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListDishLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListDishLine;

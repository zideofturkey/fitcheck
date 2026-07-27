const { _fetchListDishManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class _fetchListDishRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("_fetchListDish", "_fetchlistdish", req, res);
    this.dataName = "dishes";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListDishManager(this._req, "rest");
  }
}

const _fetchListDish = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListDishRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListDish;

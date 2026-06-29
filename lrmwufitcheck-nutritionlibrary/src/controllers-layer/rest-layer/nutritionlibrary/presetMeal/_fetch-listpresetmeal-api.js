const { _fetchListPresetMealManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class _fetchListPresetMealRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("_fetchListPresetMeal", "_fetchlistpresetmeal", req, res);
    this.dataName = "presetMeals";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListPresetMealManager(this._req, "rest");
  }
}

const _fetchListPresetMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListPresetMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListPresetMeal;

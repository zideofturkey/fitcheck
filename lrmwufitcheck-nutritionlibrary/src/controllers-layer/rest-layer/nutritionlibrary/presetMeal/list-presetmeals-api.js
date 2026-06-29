const { ListPresetMealsManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class ListPresetMealsRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("listPresetMeals", "listpresetmeals", req, res);
    this.dataName = "presetMeals";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListPresetMealsManager(this._req, "rest");
  }
}

const listPresetMeals = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListPresetMealsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listPresetMeals;

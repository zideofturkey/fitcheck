const { GetPresetMealManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetPresetMealRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getPresetMeal", "getpresetmeal", req, res);
    this.dataName = "presetMeal";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetPresetMealManager(this._req, "rest");
  }
}

const getPresetMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetPresetMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getPresetMeal;

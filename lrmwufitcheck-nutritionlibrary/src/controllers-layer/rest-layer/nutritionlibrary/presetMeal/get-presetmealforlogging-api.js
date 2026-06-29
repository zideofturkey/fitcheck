const { GetPresetMealForLoggingManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetPresetMealForLoggingRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getPresetMealForLogging", "getpresetmealforlogging", req, res);
    this.dataName = "presetMeal";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetPresetMealForLoggingManager(this._req, "rest");
  }
}

const getPresetMealForLogging = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetPresetMealForLoggingRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getPresetMealForLogging;

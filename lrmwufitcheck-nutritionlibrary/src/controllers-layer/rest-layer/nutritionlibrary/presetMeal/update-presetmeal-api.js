const { UpdatePresetMealManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class UpdatePresetMealRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("updatePresetMeal", "updatepresetmeal", req, res);
    this.dataName = "presetMeal";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdatePresetMealManager(this._req, "rest");
  }
}

const updatePresetMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdatePresetMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updatePresetMeal;

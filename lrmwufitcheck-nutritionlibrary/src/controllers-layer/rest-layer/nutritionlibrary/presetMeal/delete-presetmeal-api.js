const { DeletePresetMealManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class DeletePresetMealRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("deletePresetMeal", "deletepresetmeal", req, res);
    this.dataName = "presetMeal";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeletePresetMealManager(this._req, "rest");
  }
}

const deletePresetMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeletePresetMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deletePresetMeal;

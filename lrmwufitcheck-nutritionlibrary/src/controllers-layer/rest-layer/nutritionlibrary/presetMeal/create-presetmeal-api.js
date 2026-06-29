const { CreatePresetMealManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class CreatePresetMealRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("createPresetMeal", "createpresetmeal", req, res);
    this.dataName = "presetMeal";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreatePresetMealManager(this._req, "rest");
  }
}

const createPresetMeal = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreatePresetMealRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createPresetMeal;

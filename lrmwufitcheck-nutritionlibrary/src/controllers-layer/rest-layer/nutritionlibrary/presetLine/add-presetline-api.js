const { AddPresetLineManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class AddPresetLineRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("addPresetLine", "addpresetline", req, res);
    this.dataName = "presetLine";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new AddPresetLineManager(this._req, "rest");
  }
}

const addPresetLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new AddPresetLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = addPresetLine;

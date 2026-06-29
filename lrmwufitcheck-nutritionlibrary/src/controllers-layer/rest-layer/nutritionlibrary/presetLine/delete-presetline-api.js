const { DeletePresetLineManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class DeletePresetLineRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("deletePresetLine", "deletepresetline", req, res);
    this.dataName = "presetLine";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeletePresetLineManager(this._req, "rest");
  }
}

const deletePresetLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeletePresetLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deletePresetLine;

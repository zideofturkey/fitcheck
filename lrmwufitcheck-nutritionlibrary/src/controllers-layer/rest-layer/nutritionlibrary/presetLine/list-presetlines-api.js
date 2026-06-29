const { ListPresetLinesManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class ListPresetLinesRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("listPresetLines", "listpresetlines", req, res);
    this.dataName = "presetLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListPresetLinesManager(this._req, "rest");
  }
}

const listPresetLines = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListPresetLinesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listPresetLines;

const { _fetchListPresetLineManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class _fetchListPresetLineRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("_fetchListPresetLine", "_fetchlistpresetline", req, res);
    this.dataName = "presetLines";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListPresetLineManager(this._req, "rest");
  }
}

const _fetchListPresetLine = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListPresetLineRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListPresetLine;

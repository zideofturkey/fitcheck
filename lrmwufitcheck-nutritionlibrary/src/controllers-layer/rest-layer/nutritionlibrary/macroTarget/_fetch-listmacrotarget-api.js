const { _fetchListMacroTargetManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class _fetchListMacroTargetRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("_fetchListMacroTarget", "_fetchlistmacrotarget", req, res);
    this.dataName = "macroTargets";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListMacroTargetManager(this._req, "rest");
  }
}

const _fetchListMacroTarget = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListMacroTargetRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListMacroTarget;

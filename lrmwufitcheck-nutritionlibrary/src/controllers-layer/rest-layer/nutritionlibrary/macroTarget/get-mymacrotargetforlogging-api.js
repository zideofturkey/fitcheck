const { GetMyMacroTargetForLoggingManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetMyMacroTargetForLoggingRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getMyMacroTargetForLogging", "getmymacrotargetforlogging", req, res);
    this.dataName = "macroTarget";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetMyMacroTargetForLoggingManager(this._req, "rest");
  }
}

const getMyMacroTargetForLogging = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetMyMacroTargetForLoggingRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getMyMacroTargetForLogging;

const { GetMyMacroTargetManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class GetMyMacroTargetRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("getMyMacroTarget", "getmymacrotarget", req, res);
    this.dataName = "macroTarget";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetMyMacroTargetManager(this._req, "rest");
  }
}

const getMyMacroTarget = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetMyMacroTargetRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getMyMacroTarget;

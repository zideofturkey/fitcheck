const { SetMacroTargetManager } = require("apiLayer");

const NutritionLibraryServiceRestController = require("../../NutritionLibraryServiceRestController");

class SetMacroTargetRestController extends NutritionLibraryServiceRestController {
  constructor(req, res) {
    super("setMacroTarget", "setmacrotarget", req, res);
    this.dataName = "macroTarget";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new SetMacroTargetManager(this._req, "rest");
  }
}

const setMacroTarget = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new SetMacroTargetRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = setMacroTarget;

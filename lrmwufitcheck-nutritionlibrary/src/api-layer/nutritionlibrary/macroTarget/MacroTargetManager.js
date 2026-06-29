const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const NutritionLibraryServiceManager = require("../../service-manager/NutritionLibraryServiceManager");

/* Base Class For the Crud Routes Of DbObject MacroTarget */
class MacroTargetManager extends NutritionLibraryServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "macroTarget";
    this.modelName = "MacroTarget";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = MacroTargetManager;

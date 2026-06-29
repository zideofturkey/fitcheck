const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const NutritionLibraryServiceManager = require("../../service-manager/NutritionLibraryServiceManager");

/* Base Class For the Crud Routes Of DbObject PresetLine */
class PresetLineManager extends NutritionLibraryServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "presetLine";
    this.modelName = "PresetLine";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = PresetLineManager;

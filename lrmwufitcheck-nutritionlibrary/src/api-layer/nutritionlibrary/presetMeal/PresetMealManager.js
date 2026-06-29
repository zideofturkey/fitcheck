const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const NutritionLibraryServiceManager = require("../../service-manager/NutritionLibraryServiceManager");

/* Base Class For the Crud Routes Of DbObject PresetMeal */
class PresetMealManager extends NutritionLibraryServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "presetMeal";
    this.modelName = "PresetMeal";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = PresetMealManager;

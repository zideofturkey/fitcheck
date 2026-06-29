const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const NutritionAiServiceManager = require("../../service-manager/NutritionAiServiceManager");

/* Base Class For the Crud Routes Of DbObject AiGuidanceNote */
class AiGuidanceNoteManager extends NutritionAiServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "aiGuidanceNote";
    this.modelName = "AiGuidanceNote";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = AiGuidanceNoteManager;

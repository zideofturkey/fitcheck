const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const NutritionAiServiceManager = require("../../service-manager/NutritionAiServiceManager");

/* Base Class For the Crud Routes Of DbObject AiCandidateMeal */
class AiCandidateMealManager extends NutritionAiServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "aiCandidateMeal";
    this.modelName = "AiCandidateMeal";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = AiCandidateMealManager;

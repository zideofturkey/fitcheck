const ApiManager = require("./ApiManager");

const { md5 } = require("common");

class NutritionAiServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
    this.serviceCodename = "lrmwufitcheck-nutritionai-service";
    this.membershipCache = new Map();
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }
}

module.exports = NutritionAiServiceManager;

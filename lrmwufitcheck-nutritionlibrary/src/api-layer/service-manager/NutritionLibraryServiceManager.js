const ApiManager = require("./ApiManager");

const { md5 } = require("common");

class NutritionLibraryServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
    this.serviceCodename = "lrmwufitcheck-nutritionlibrary-service";
    this.membershipCache = new Map();
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }
}

module.exports = NutritionLibraryServiceManager;

const ApiManager = require("./ApiManager");

const { md5 } = require("common");

class MealTrackerServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
    this.serviceCodename = "lrmwufitcheck-mealtracker-service";
    this.membershipCache = new Map();
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }
}

module.exports = MealTrackerServiceManager;

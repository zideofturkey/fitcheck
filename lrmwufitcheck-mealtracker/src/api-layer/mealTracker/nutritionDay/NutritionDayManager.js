const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const MealTrackerServiceManager = require("../../service-manager/MealTrackerServiceManager");

/* Base Class For the Crud Routes Of DbObject NutritionDay */
class NutritionDayManager extends MealTrackerServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "nutritionDay";
    this.modelName = "NutritionDay";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = NutritionDayManager;

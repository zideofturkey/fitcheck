const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const MealTrackerServiceManager = require("../../service-manager/MealTrackerServiceManager");

/* Base Class For the Crud Routes Of DbObject MealLog */
class MealLogManager extends MealTrackerServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "mealLog";
    this.modelName = "MealLog";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = MealLogManager;

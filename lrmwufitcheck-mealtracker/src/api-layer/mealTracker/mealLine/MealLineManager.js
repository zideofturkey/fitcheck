const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const MealTrackerServiceManager = require("../../service-manager/MealTrackerServiceManager");

/* Base Class For the Crud Routes Of DbObject MealLine */
class MealLineManager extends MealTrackerServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "mealLine";
    this.modelName = "MealLine";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = MealLineManager;

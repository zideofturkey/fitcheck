const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const NutritionLibraryServiceManager = require("../../service-manager/NutritionLibraryServiceManager");

/* Base Class For the Crud Routes Of DbObject DishLine */
class DishLineManager extends NutritionLibraryServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "dishLine";
    this.modelName = "DishLine";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = DishLineManager;

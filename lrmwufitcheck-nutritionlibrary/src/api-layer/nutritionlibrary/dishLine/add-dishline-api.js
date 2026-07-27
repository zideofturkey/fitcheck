const { runMScript } = require("common");

const DishLineManager = require("./DishLineManager");

const {
  dbScriptAddDishline,
  getDishByQuery,
  getFoodItemByQuery,
} = require("dbLayer");
const { ElasticIndexer } = require("serviceCommon");
const {
  hexaLogger,
  PaymentGateError,
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  isValidObjectId,
  isValidUUID,
  getRedisData,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class AddDishLineManager extends DishLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "addDishLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dishLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.dishLineId = this.dishLineId;
    jsonObj.foodItemId = this.foodItemId;
    jsonObj.gramAmount = this.gramAmount;
    jsonObj.dishId = this.dishId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.dishLineId = request.body?.["dishLineId"];
    this.foodItemId = request.body?.["foodItemId"];
    this.gramAmount = request.body?.["gramAmount"];
    this.dishId = request.params?.["dishId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.dishLineId = this.dishLineId ?? this.id;
    this.id = this.dishLineId;
  }

  readMcpParameters(request) {
    this.dishLineId = request.mcpParams?.["dishLineId"];
    this.foodItemId = request.mcpParams?.["foodItemId"];
    this.gramAmount = request.mcpParams?.["gramAmount"];
    this.dishId = request.mcpParams?.["dishId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.dishLineId = this.dishLineId ?? this.id;
    this.id = this.dishLineId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    if (this.id) this.dishLineId = this.id;
    if (!this.dishLineId) this.dishLineId = newUUID(false);
    this.id = this.dishLineId;

    const dataClause = {
      id: this.dishLineId,
      dishId: this.dishId,
      foodItemId: this.foodItemId,
      lineFoodName: this.resolvedFood.foodName,
      gramAmount: this.gramAmount,
      lineCalories: (this.resolvedFood.caloriePer100g * this.gramAmount) / 100,
      lineProtein: (this.resolvedFood.proteinPer100g * this.gramAmount) / 100,
      lineCarbohydrates:
        (this.resolvedFood.carbohydratePer100g * this.gramAmount) / 100,
      lineFat: (this.resolvedFood.fatPer100g * this.gramAmount) / 100,
      lineSugar: (this.resolvedFood.sugarPer100g * this.gramAmount) / 100,
      lineFiber: (this.resolvedFood.fiberPer100g * this.gramAmount) / 100,
      isActive: true,
      _archivedAt: null,
    };

    // Resolve any Promise-valued fields.
    for (const _dcKey of Object.keys(dataClause)) {
      const _dcVal = dataClause[_dcKey];
      if (_dcVal && typeof _dcVal.then === "function") {
        dataClause[_dcKey] = await _dcVal;
      }
    }

    // ID-typed dataClause fields strict-validation
    {
      const { isValidUUID } = require("common");
      const _idValidator = isValidUUID;
      const _idFieldsAndIsArray = [
        ["dishId", false],
        ["foodItemId", false],
      ];
      for (const [_idKey, _isArr] of _idFieldsAndIsArray) {
        const _idVal = dataClause[_idKey];
        if (_idVal == null) continue; // nullable / unset ID columns OK
        if (_isArr) {
          if (!Array.isArray(_idVal)) {
            throw new BadRequestError(`errMsg_${_idKey}MustBeAnArray`);
          }
          for (const _item of _idVal) {
            if (_item == null) continue;
            if (!_idValidator(_item)) {
              throw new BadRequestError(
                `errMsg_${_idKey}ArrayHasAnInvalidItem`,
              );
            }
          }
        } else {
          if (!_idValidator(_idVal)) {
            throw new BadRequestError(`errMsg_${_idKey}TypeIsNotValid`);
          }
        }
      }
    }

    return dataClause;
  }

  checkParameterType_dishLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_dishLineId() {
    if (this.dishLineId == null) return;

    if (Array.isArray(this.dishLineId)) {
      throw new BadRequestError("errMsg_dishLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_dishLineId(this.dishLineId)) {
      throw new BadRequestError("errMsg_dishLineIdTypeIsNotValid");
    }
  }

  checkParameterType_foodItemId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_foodItemId() {
    if (this.foodItemId == null) {
      throw new BadRequestError("errMsg_foodItemIdisRequired");
    }

    if (Array.isArray(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_foodItemId(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdTypeIsNotValid");
    }
  }

  checkParameterType_gramAmount(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_gramAmount() {
    if (this.gramAmount == null) {
      throw new BadRequestError("errMsg_gramAmountisRequired");
    }

    if (Array.isArray(this.gramAmount)) {
      throw new BadRequestError("errMsg_gramAmountMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_gramAmount(this.gramAmount)) {
      throw new BadRequestError("errMsg_gramAmountTypeIsNotValid");
    }
  }

  checkParameter_dishId() {
    if (this.dishId == null) {
      throw new BadRequestError("errMsg_dishIdisRequired");
    }

    if (Array.isArray(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    if (this.dishLineId === "") this.dishLineId = null;
    this.checkParameter_dishLineId();

    if (this.foodItemId === "") this.foodItemId = null;
    this.checkParameter_foodItemId();

    this.checkParameter_gramAmount();

    this.checkParameter_dishId();

    // filter parameters
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptAddDishline(this);

    /*
    the main operation result is accessable in the context through
    this.dbResult, this.dishLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentDish = await this.fetchParentDish();
    } catch (err) {
      console.log("fetchParentDish Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validateParentDishExists();
    } catch (err) {
      console.log("validateParentDishExists Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.resolvedFood = await this.fetchFoodItem();
    } catch (err) {
      console.log("fetchFoodItem Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validateFoodItemExists();
    } catch (err) {
      console.log("validateFoodItemExists Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainCreateOperation() {
    try {
      await this.recalcDishTotalsAfterAdd();
    } catch (err) {
      console.log("recalcDishTotalsAfterAdd Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Ensure the parent dish exists and belongs to the user
   ***********************************************************************/

  async validateParentDishExists() {
    if (this.checkAbsolute()) return true;

    if (!this.parentDish) {
      throw new ForbiddenError("Dish not found or access denied");
    }
    return true;
  }

  /***********************************************************************
   ** Ensure the food item exists and belongs to the user
   ***********************************************************************/

  async validateFoodItemExists() {
    if (!this.resolvedFood) {
      throw new NotFoundError("Food item not found");
    }
    return true;
  }

  /***********************************************************************
   ** Fetch the parent dish to validate ownership
   ***********************************************************************/
  async fetchParentDish() {
    const userQuery = {
      $and: [
        { id: this.dishId, userId: this.session.userId, isActive: true },
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    const data = await getDishByQuery(scriptQuery);

    return data;
  }

  /***********************************************************************
   ** Fetch the food item to validate ownership and get nutrition values
   ***********************************************************************/
  async fetchFoodItem() {
    const userQuery = {
      $and: [
        { id: this.foodItemId, userId: this.session.userId, isActive: true },
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    const data = await getFoodItemByQuery(scriptQuery);

    return data;
  }

  /***********************************************************************
   ** Recalculate and persist aggregate nutrition totals (and total gram
   ** weight) on the parent dish after the new line is created
   ***********************************************************************/

  async recalcDishTotalsAfterAdd() {
    return await LIB.recalculateDishTotals(this.dishId);
  }
}

module.exports = AddDishLineManager;

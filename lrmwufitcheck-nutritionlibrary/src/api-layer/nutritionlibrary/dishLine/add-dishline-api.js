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
    jsonObj.manualFoodName = this.manualFoodName;
    jsonObj.manualCaloriePer100g = this.manualCaloriePer100g;
    jsonObj.manualProteinPer100g = this.manualProteinPer100g;
    jsonObj.manualCarbohydratePer100g = this.manualCarbohydratePer100g;
    jsonObj.manualFatPer100g = this.manualFatPer100g;
    jsonObj.manualSugarPer100g = this.manualSugarPer100g;
    jsonObj.manualFiberPer100g = this.manualFiberPer100g;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.dishLineId = request.body?.["dishLineId"];
    this.foodItemId = request.body?.["foodItemId"];
    this.gramAmount = request.body?.["gramAmount"];
    this.dishId = request.params?.["dishId"];
    this.manualFoodName = request.body?.["manualFoodName"];
    this.manualCaloriePer100g = request.body?.["manualCaloriePer100g"];
    this.manualProteinPer100g = request.body?.["manualProteinPer100g"];
    this.manualCarbohydratePer100g =
      request.body?.["manualCarbohydratePer100g"];
    this.manualFatPer100g = request.body?.["manualFatPer100g"];
    this.manualSugarPer100g = request.body?.["manualSugarPer100g"];
    this.manualFiberPer100g = request.body?.["manualFiberPer100g"];
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
    this.manualFoodName = request.mcpParams?.["manualFoodName"];
    this.manualCaloriePer100g = request.mcpParams?.["manualCaloriePer100g"];
    this.manualProteinPer100g = request.mcpParams?.["manualProteinPer100g"];
    this.manualCarbohydratePer100g =
      request.mcpParams?.["manualCarbohydratePer100g"];
    this.manualFatPer100g = request.mcpParams?.["manualFatPer100g"];
    this.manualSugarPer100g = request.mcpParams?.["manualSugarPer100g"];
    this.manualFiberPer100g = request.mcpParams?.["manualFiberPer100g"];
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

    // Either a library foodItem reference, or a fully embedded/manual line
    // (foodItemId left null) whose own per-100g values were supplied
    // directly in the request - never both, enforced in
    // validateExactlyOneSource().
    const isManual = this.foodItemId == null;
    const source = isManual
      ? {
          foodName: this.manualFoodName,
          caloriePer100g: this.manualCaloriePer100g,
          proteinPer100g: this.manualProteinPer100g,
          carbohydratePer100g: this.manualCarbohydratePer100g,
          fatPer100g: this.manualFatPer100g,
          sugarPer100g: this.manualSugarPer100g,
          fiberPer100g: this.manualFiberPer100g,
        }
      : this.resolvedFood;

    const dataClause = {
      id: this.dishLineId,
      dishId: this.dishId,
      foodItemId: isManual ? null : this.foodItemId,
      lineFoodName: source.foodName,
      gramAmount: this.gramAmount,
      lineCalories: (source.caloriePer100g * this.gramAmount) / 100,
      lineProtein: (source.proteinPer100g * this.gramAmount) / 100,
      lineCarbohydrates:
        (source.carbohydratePer100g * this.gramAmount) / 100,
      lineFat: (source.fatPer100g * this.gramAmount) / 100,
      lineSugar: (source.sugarPer100g * this.gramAmount) / 100,
      lineFiber: (source.fiberPer100g * this.gramAmount) / 100,
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
    if (this.foodItemId == null) return;

    if (Array.isArray(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_foodItemId(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdTypeIsNotValid");
    }
  }

  checkParameter_manualFoodName() {
    if (this.manualFoodName == null) return;
    if (typeof this.manualFoodName !== "string" || !this.manualFoodName.trim()) {
      throw new BadRequestError("errMsg_manualFoodNameTypeIsNotValid");
    }
  }

  checkParameter_manualNutritionValues() {
    const fields = [
      "manualCaloriePer100g",
      "manualProteinPer100g",
      "manualCarbohydratePer100g",
      "manualFatPer100g",
      "manualSugarPer100g",
      "manualFiberPer100g",
    ];
    for (const field of fields) {
      if (this[field] == null) continue;
      if (isNaN(this[field])) {
        throw new BadRequestError(`errMsg_${field}TypeIsNotValid`);
      }
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

    if (this.manualFoodName === "") this.manualFoodName = null;
    this.checkParameter_manualFoodName();
    this.checkParameter_manualNutritionValues();

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
      await this.validateExactlyOneSource();
    } catch (err) {
      console.log("validateExactlyOneSource Action Error:", err.message);
      //**errorLog
      throw err;
    }
    if (this.foodItemId != null) {
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
   ** Ensure exactly one nutrition source was provided: either a library
   ** foodItemId, or a fully embedded manual entry (name + per-100g
   ** values) with no library reference at all.
   ***********************************************************************/

  async validateExactlyOneSource() {
    const hasFood = this.foodItemId != null;
    const hasManual = this.manualFoodName != null;
    if (hasFood === hasManual) {
      throw new BadRequestError(
        "errMsg_ExactlyOneOfFoodItemIdOrManualEntryMustBeProvided",
      );
    }
    if (hasManual) {
      const fields = [
        "manualCaloriePer100g",
        "manualProteinPer100g",
        "manualCarbohydratePer100g",
        "manualFatPer100g",
        "manualSugarPer100g",
        "manualFiberPer100g",
      ];
      for (const field of fields) {
        if (this[field] == null) {
          throw new BadRequestError(`errMsg_${field}isRequired`);
        }
      }
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

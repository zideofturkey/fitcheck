const { runMScript } = require("common");

const PresetLineManager = require("./PresetLineManager");

const {
  dbScriptAddPresetline,
  getPresetMealByQuery,
  getFoodItemByQuery,
  getDishByQuery,
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

class AddPresetLineManager extends PresetLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "addPresetLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.presetLineId = this.presetLineId;
    jsonObj.foodItemId = this.foodItemId;
    jsonObj.dishId = this.dishId;
    jsonObj.gramAmount = this.gramAmount;
    jsonObj.presetMealId = this.presetMealId;
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
    this.presetLineId = request.body?.["presetLineId"];
    this.foodItemId = request.body?.["foodItemId"];
    this.dishId = request.body?.["dishId"];
    this.gramAmount = request.body?.["gramAmount"];
    this.presetMealId = request.params?.["presetMealId"];
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

    this.presetLineId = this.presetLineId ?? this.id;
    this.id = this.presetLineId;
  }

  readMcpParameters(request) {
    this.presetLineId = request.mcpParams?.["presetLineId"];
    this.foodItemId = request.mcpParams?.["foodItemId"];
    this.dishId = request.mcpParams?.["dishId"];
    this.gramAmount = request.mcpParams?.["gramAmount"];
    this.presetMealId = request.mcpParams?.["presetMealId"];
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

    this.presetLineId = this.presetLineId ?? this.id;
    this.id = this.presetLineId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.presetLineId = this.id;
    if (!this.presetLineId) this.presetLineId = newUUID(false);
    this.id = this.presetLineId;

    // Three-way nutrition source: exactly one of foodItemId/dishId/manual
    // is set by this point (enforced in validateExactlyOneSource()). A
    // foodItem line scales per-100g values by gramAmount. A dish line
    // scales the dish's own totals against the dish's totalGramWeight
    // (its base recipe weight), mirroring the per-100g approach but using
    // the dish's own weight as the base instead of a fixed 100g. A manual
    // line is a fully embedded, library-independent entry (foodItemId and
    // dishId both null) whose own per-100g values were supplied directly
    // in the request, scaled the same way as a foodItem line.
    const isFoodSource = this.foodItemId != null;
    const isManual = !isFoodSource && this.dishId == null;
    const dishFactor =
      !isFoodSource && !isManual
        ? this.resolvedDish.totalGramWeight > 0
          ? this.gramAmount / this.resolvedDish.totalGramWeight
          : 0
        : null;

    const round2 = (v) => Math.round(v * 100) / 100;

    const manualSource = isManual
      ? {
          foodName: this.manualFoodName,
          caloriePer100g: this.manualCaloriePer100g,
          proteinPer100g: this.manualProteinPer100g,
          carbohydratePer100g: this.manualCarbohydratePer100g,
          fatPer100g: this.manualFatPer100g,
          sugarPer100g: this.manualSugarPer100g,
          fiberPer100g: this.manualFiberPer100g,
        }
      : null;

    const dataClause = {
      id: this.presetLineId,
      presetMealId: this.presetMealId,
      foodItemId: this.foodItemId ?? null,
      dishId: this.dishId ?? null,
      lineFoodName: isFoodSource
        ? this.resolvedFood.foodName
        : isManual
          ? manualSource.foodName
          : this.resolvedDish.dishName,
      gramAmount: this.gramAmount,
      lineCalories: round2(
        isFoodSource
          ? (this.resolvedFood.caloriePer100g * this.gramAmount) / 100
          : isManual
            ? (manualSource.caloriePer100g * this.gramAmount) / 100
            : this.resolvedDish.totalCalories * dishFactor,
      ),
      lineProtein: round2(
        isFoodSource
          ? (this.resolvedFood.proteinPer100g * this.gramAmount) / 100
          : isManual
            ? (manualSource.proteinPer100g * this.gramAmount) / 100
            : this.resolvedDish.totalProtein * dishFactor,
      ),
      lineCarbohydrates: round2(
        isFoodSource
          ? (this.resolvedFood.carbohydratePer100g * this.gramAmount) / 100
          : isManual
            ? (manualSource.carbohydratePer100g * this.gramAmount) / 100
            : this.resolvedDish.totalCarbohydrates * dishFactor,
      ),
      lineFat: round2(
        isFoodSource
          ? (this.resolvedFood.fatPer100g * this.gramAmount) / 100
          : isManual
            ? (manualSource.fatPer100g * this.gramAmount) / 100
            : this.resolvedDish.totalFat * dishFactor,
      ),
      lineSugar: round2(
        isFoodSource
          ? (this.resolvedFood.sugarPer100g * this.gramAmount) / 100
          : isManual
            ? (manualSource.sugarPer100g * this.gramAmount) / 100
            : this.resolvedDish.totalSugar * dishFactor,
      ),
      lineFiber: round2(
        isFoodSource
          ? (this.resolvedFood.fiberPer100g * this.gramAmount) / 100
          : isManual
            ? (manualSource.fiberPer100g * this.gramAmount) / 100
            : this.resolvedDish.totalFiber * dishFactor,
      ),
      isActive: true,
      _archivedAt: null,
    };

    // Resolve any Promise-valued fields. Designers should normally write
    // `await LIB.xx()` in MScript when the call is async, but if they
    // forget the `await`, runMScript returns the unresolved Promise and
    // it lands here. Awaiting Promise values keeps the row write safe;
    // sync values pass through untouched (no microtask cost).
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
        ["presetMealId", false],
        ["foodItemId", false],
        ["dishId", false],
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

  checkParameterType_presetLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_presetLineId() {
    if (this.presetLineId == null) return;

    if (Array.isArray(this.presetLineId)) {
      throw new BadRequestError("errMsg_presetLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_presetLineId(this.presetLineId)) {
      throw new BadRequestError("errMsg_presetLineIdTypeIsNotValid");
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

  checkParameterType_dishId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_dishId() {
    if (this.dishId == null) return;

    if (Array.isArray(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_dishId(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdTypeIsNotValid");
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

  checkParameter_presetMealId() {
    if (this.presetMealId == null) {
      throw new BadRequestError("errMsg_presetMealIdisRequired");
    }

    if (Array.isArray(this.presetMealId)) {
      throw new BadRequestError("errMsg_presetMealIdMustNotBeAnArray");
    }

    // Parameter Type: String
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

    require("../../../library/functions/validateNutritionValues")({
      caloriePer100g: this.manualCaloriePer100g,
      proteinPer100g: this.manualProteinPer100g,
      carbohydratePer100g: this.manualCarbohydratePer100g,
      fatPer100g: this.manualFatPer100g,
      sugarPer100g: this.manualSugarPer100g,
      fiberPer100g: this.manualFiberPer100g,
    });
  }

  checkParameters() {
    if (this.presetLineId === "") this.presetLineId = null;
    this.checkParameter_presetLineId();

    if (this.foodItemId === "") this.foodItemId = null;
    this.checkParameter_foodItemId();

    if (this.dishId === "") this.dishId = null;
    this.checkParameter_dishId();

    if (this.manualFoodName === "") this.manualFoodName = null;
    this.checkParameter_manualFoodName();
    this.checkParameter_manualNutritionValues();

    this.checkParameter_gramAmount();

    this.checkParameter_presetMealId();

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
    return await dbScriptAddPresetline(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.presetLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentPreset = await this.fetchParentPreset();
    } catch (err) {
      console.log("fetchParentPreset Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validateParentPresetExists();
    } catch (err) {
      console.log("validateParentPresetExists Action Error:", err.message);
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
    } else if (this.dishId != null) {
      try {
        this.resolvedDish = await this.fetchDish();
      } catch (err) {
        console.log("fetchDish Action Error:", err.message);
        //**errorLog
        throw err;
      }
      try {
        await this.validateDishExists();
      } catch (err) {
        console.log("validateDishExists Action Error:", err.message);
        //**errorLog
        throw err;
      }
    }
    // else: manual/embedded entry - no library record to fetch or validate,
    // validateExactlyOneSource() already confirmed the manual fields.
  }

  async afterMainCreateOperation() {
    try {
      await this.recalcPresetTotalsAfterAdd();
    } catch (err) {
      console.log("recalcPresetTotalsAfterAdd Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Ensure the parent preset exists and belongs to the user
   ***********************************************************************/

  async validateParentPresetExists() {
    if (this.checkAbsolute()) return true;

    let isValid;
    try {
      isValid = runMScript(() => this.parentPreset != null, {
        path: "services[2].businessLogic[12].actions.validationActions[0].validationScript",
      });
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isValid && typeof isValid.then === "function") {
        isValid = await isValid;
      }
    } catch (err) {
      // Designer-emitted 4xx throws (BadRequestError, ForbiddenError,
      // NotFoundError, ConflictError, UnprocessableEntityError, …) propagate
      // verbatim — the MScript intentionally surfaced a typed business
      // validation failure and its message belongs in the response. Only
      // wrap genuinely unexpected exceptions (TypeError, ReferenceError,
      // null-deref, etc.) as 500 so operators can tell "rule rejected
      // input" from "the validation itself crashed".
      if (
        err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
      ) {
        throw err;
      }
      throw new HttpServerError(
        `Validation 'validateParentPresetExists' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new ForbiddenError("Preset meal not found or access denied");
    }
    return isValid;
  }

  /***********************************************************************
   ** Ensure exactly one nutrition source was provided: a foodItemId, a
   ** dishId, or a fully embedded manual entry (name + per-100g values)
   ** with no library reference at all - never more than one, never none.
   ***********************************************************************/

  async validateExactlyOneSource() {
    const hasFood = this.foodItemId != null;
    const hasDish = this.dishId != null;
    const hasManual = this.manualFoodName != null;
    const sourceCount = [hasFood, hasDish, hasManual].filter(Boolean).length;
    if (sourceCount !== 1) {
      throw new BadRequestError(
        "errMsg_ExactlyOneOfFoodItemIdOrDishIdOrManualEntryMustBeProvided",
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
   ** Ensure the food item exists and belongs to the user
   ***********************************************************************/

  async validateFoodItemExists() {
    let isValid;
    try {
      isValid = runMScript(() => this.resolvedFood != null, {
        path: "services[2].businessLogic[12].actions.validationActions[1].validationScript",
      });
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isValid && typeof isValid.then === "function") {
        isValid = await isValid;
      }
    } catch (err) {
      // Designer-emitted 4xx throws (BadRequestError, ForbiddenError,
      // NotFoundError, ConflictError, UnprocessableEntityError, …) propagate
      // verbatim — the MScript intentionally surfaced a typed business
      // validation failure and its message belongs in the response. Only
      // wrap genuinely unexpected exceptions (TypeError, ReferenceError,
      // null-deref, etc.) as 500 so operators can tell "rule rejected
      // input" from "the validation itself crashed".
      if (
        err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
      ) {
        throw err;
      }
      throw new HttpServerError(
        `Validation 'validateFoodItemExists' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new NotFoundError("Food item not found");
    }
    return isValid;
  }

  /***********************************************************************
   ** Fetch the parent preset meal to validate ownership
   ***********************************************************************/
  async fetchParentPreset() {
    // Fetch Object on childObject presetMeal

    const userQuery = {
      $and: [
        runMScript(
          () => ({
            id: this.presetMealId,
            userId: this.session.userId,
            isActive: true,
          }),
          {
            path: "services[2].businessLogic[12].actions.fetchObjectActions[0].whereClause",
          },
        ),
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getPresetMealByQuery(scriptQuery);

    return data;
  }

  /***********************************************************************
   ** Fetch the food item to validate ownership and get nutrition values
   ***********************************************************************/
  async fetchFoodItem() {
    // Fetch Object on childObject foodItem

    const userQuery = {
      $and: [
        {
          id: this.foodItemId,
          $or: [{ userId: this.session.userId }, { isGlobal: true }],
        },
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getFoodItemByQuery(scriptQuery);

    return data;
  }

  /***********************************************************************
   ** Ensure the dish exists and belongs to the user
   ***********************************************************************/

  async validateDishExists() {
    if (!this.resolvedDish) {
      throw new NotFoundError("Dish not found");
    }
    return true;
  }

  /***********************************************************************
   ** Fetch the dish to validate ownership and get its aggregate nutrition
   ***********************************************************************/
  async fetchDish() {
    if (!this.dishId) return null;

    const userQuery = {
      $and: [
        {
          id: this.dishId,
          $or: [{ userId: this.session.userId }, { isGlobal: true }],
        },
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    const data = await getDishByQuery(scriptQuery);

    return data;
  }

  /***********************************************************************
   ** Recalculate and persist aggregate nutrition totals on the parent
   ** preset after the new line is created
   ***********************************************************************/

  async recalcPresetTotalsAfterAdd() {
    try {
      return runMScript(() => LIB.recalculatePresetTotals(this.presetMealId), {
        path: "services[2].businessLogic[12].actions.functionCallActions[0].callScript",
      });
    } catch (err) {
      console.error(
        "Error in FunctionCallAction recalcPresetTotalsAfterAdd:",
        err,
      );
      throw err;
    }
  }
}

module.exports = AddPresetLineManager;

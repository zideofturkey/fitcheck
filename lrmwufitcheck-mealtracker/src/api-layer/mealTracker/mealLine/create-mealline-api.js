const { runMScript } = require("common");

const MealLineManager = require("./MealLineManager");

const { dbScriptCreateMealline, getMealLogByQuery } = require("dbLayer");
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

class CreateMealLineManager extends MealLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createMealLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLineId = this.mealLineId;
    jsonObj.mealLogId = this.mealLogId;
    jsonObj.itemName = this.itemName;
    jsonObj.consumedGrams = this.consumedGrams;
    jsonObj.itemCalories = this.itemCalories;
    jsonObj.itemProtein = this.itemProtein;
    jsonObj.itemCarbohydrates = this.itemCarbohydrates;
    jsonObj.itemFat = this.itemFat;
    jsonObj.itemSugar = this.itemSugar;
    jsonObj.itemFiber = this.itemFiber;
    jsonObj.lineSource = this.lineSource;
    jsonObj.sourceFoodItemId = this.sourceFoodItemId;
    jsonObj.sourcePresetMealId = this.sourcePresetMealId;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLineId = request.body?.["mealLineId"];
    this.mealLogId = request.body?.["mealLogId"];
    this.itemName = request.body?.["itemName"];
    this.consumedGrams = request.body?.["consumedGrams"];
    this.itemCalories = request.body?.["itemCalories"];
    this.itemProtein = request.body?.["itemProtein"];
    this.itemCarbohydrates = request.body?.["itemCarbohydrates"];
    this.itemFat = request.body?.["itemFat"];
    this.itemSugar = request.body?.["itemSugar"];
    this.itemFiber = request.body?.["itemFiber"];
    this.lineSource = request.body?.["lineSource"];
    this.sourceFoodItemId = request.body?.["sourceFoodItemId"];
    this.sourcePresetMealId = request.body?.["sourcePresetMealId"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.mealLineId = this.mealLineId ?? this.id;
    this.id = this.mealLineId;
  }

  readMcpParameters(request) {
    this.mealLineId = request.mcpParams?.["mealLineId"];
    this.mealLogId = request.mcpParams?.["mealLogId"];
    this.itemName = request.mcpParams?.["itemName"];
    this.consumedGrams = request.mcpParams?.["consumedGrams"];
    this.itemCalories = request.mcpParams?.["itemCalories"];
    this.itemProtein = request.mcpParams?.["itemProtein"];
    this.itemCarbohydrates = request.mcpParams?.["itemCarbohydrates"];
    this.itemFat = request.mcpParams?.["itemFat"];
    this.itemSugar = request.mcpParams?.["itemSugar"];
    this.itemFiber = request.mcpParams?.["itemFiber"];
    this.lineSource = request.mcpParams?.["lineSource"];
    this.sourceFoodItemId = request.mcpParams?.["sourceFoodItemId"];
    this.sourcePresetMealId = request.mcpParams?.["sourcePresetMealId"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.mealLineId = this.mealLineId ?? this.id;
    this.id = this.mealLineId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.mealLineId = this.id;
    if (!this.mealLineId) this.mealLineId = newUUID(false);
    this.id = this.mealLineId;

    const dataClause = {
      id: this.mealLineId,
      userId: this.userId,
      mealLogId: runMScript(() => this.mealLogId, {
        path: "services[3].businessLogic[5].dataClauseItems[0].value",
      }),
      itemName: runMScript(() => this.itemName, {
        path: "services[3].businessLogic[5].dataClauseItems[1].value",
      }),
      consumedGrams: runMScript(() => this.consumedGrams, {
        path: "services[3].businessLogic[5].dataClauseItems[2].value",
      }),
      itemCalories: runMScript(() => this.itemCalories, {
        path: "services[3].businessLogic[5].dataClauseItems[3].value",
      }),
      itemProtein: runMScript(() => this.itemProtein, {
        path: "services[3].businessLogic[5].dataClauseItems[4].value",
      }),
      itemCarbohydrates: runMScript(() => this.itemCarbohydrates, {
        path: "services[3].businessLogic[5].dataClauseItems[5].value",
      }),
      itemFat: runMScript(() => this.itemFat, {
        path: "services[3].businessLogic[5].dataClauseItems[6].value",
      }),
      itemSugar: runMScript(() => this.itemSugar, {
        path: "services[3].businessLogic[5].dataClauseItems[7].value",
      }),
      itemFiber: runMScript(() => this.itemFiber, {
        path: "services[3].businessLogic[5].dataClauseItems[8].value",
      }),
      lineSource: runMScript(() => this.lineSource, {
        path: "services[3].businessLogic[5].dataClauseItems[9].value",
      }),
      sourceFoodItemId: runMScript(() => this.sourceFoodItemId || null, {
        path: "services[3].businessLogic[5].dataClauseItems[10].value",
      }),
      sourcePresetMealId: runMScript(() => this.sourcePresetMealId || null, {
        path: "services[3].businessLogic[5].dataClauseItems[11].value",
      }),
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
        ["userId", false],
        ["mealLogId", false],
        ["sourceFoodItemId", false],
        ["sourcePresetMealId", false],
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

  checkParameterType_mealLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealLineId() {
    if (this.mealLineId == null) return;

    if (Array.isArray(this.mealLineId)) {
      throw new BadRequestError("errMsg_mealLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_mealLineId(this.mealLineId)) {
      throw new BadRequestError("errMsg_mealLineIdTypeIsNotValid");
    }
  }

  checkParameterType_mealLogId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealLogId() {
    if (this.mealLogId == null) {
      throw new BadRequestError("errMsg_mealLogIdisRequired");
    }

    if (Array.isArray(this.mealLogId)) {
      throw new BadRequestError("errMsg_mealLogIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_mealLogId(this.mealLogId)) {
      throw new BadRequestError("errMsg_mealLogIdTypeIsNotValid");
    }
  }

  checkParameter_itemName() {
    if (this.itemName == null) {
      throw new BadRequestError("errMsg_itemNameisRequired");
    }

    if (Array.isArray(this.itemName)) {
      throw new BadRequestError("errMsg_itemNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_consumedGrams(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_consumedGrams() {
    if (this.consumedGrams == null) {
      throw new BadRequestError("errMsg_consumedGramsisRequired");
    }

    if (Array.isArray(this.consumedGrams)) {
      throw new BadRequestError("errMsg_consumedGramsMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_consumedGrams(this.consumedGrams)) {
      throw new BadRequestError("errMsg_consumedGramsTypeIsNotValid");
    }
  }

  checkParameterType_itemCalories(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_itemCalories() {
    if (this.itemCalories == null) {
      throw new BadRequestError("errMsg_itemCaloriesisRequired");
    }

    if (Array.isArray(this.itemCalories)) {
      throw new BadRequestError("errMsg_itemCaloriesMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemCalories(this.itemCalories)) {
      throw new BadRequestError("errMsg_itemCaloriesTypeIsNotValid");
    }
  }

  checkParameterType_itemProtein(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_itemProtein() {
    if (this.itemProtein == null) {
      throw new BadRequestError("errMsg_itemProteinisRequired");
    }

    if (Array.isArray(this.itemProtein)) {
      throw new BadRequestError("errMsg_itemProteinMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemProtein(this.itemProtein)) {
      throw new BadRequestError("errMsg_itemProteinTypeIsNotValid");
    }
  }

  checkParameterType_itemCarbohydrates(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_itemCarbohydrates() {
    if (this.itemCarbohydrates == null) {
      throw new BadRequestError("errMsg_itemCarbohydratesisRequired");
    }

    if (Array.isArray(this.itemCarbohydrates)) {
      throw new BadRequestError("errMsg_itemCarbohydratesMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemCarbohydrates(this.itemCarbohydrates)) {
      throw new BadRequestError("errMsg_itemCarbohydratesTypeIsNotValid");
    }
  }

  checkParameterType_itemFat(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_itemFat() {
    if (this.itemFat == null) {
      throw new BadRequestError("errMsg_itemFatisRequired");
    }

    if (Array.isArray(this.itemFat)) {
      throw new BadRequestError("errMsg_itemFatMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemFat(this.itemFat)) {
      throw new BadRequestError("errMsg_itemFatTypeIsNotValid");
    }
  }

  checkParameterType_itemSugar(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_itemSugar() {
    if (this.itemSugar == null) {
      throw new BadRequestError("errMsg_itemSugarisRequired");
    }

    if (Array.isArray(this.itemSugar)) {
      throw new BadRequestError("errMsg_itemSugarMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemSugar(this.itemSugar)) {
      throw new BadRequestError("errMsg_itemSugarTypeIsNotValid");
    }
  }

  checkParameterType_itemFiber(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_itemFiber() {
    if (this.itemFiber == null) {
      throw new BadRequestError("errMsg_itemFiberisRequired");
    }

    if (Array.isArray(this.itemFiber)) {
      throw new BadRequestError("errMsg_itemFiberMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemFiber(this.itemFiber)) {
      throw new BadRequestError("errMsg_itemFiberTypeIsNotValid");
    }
  }

  checkParameterType_lineSource(paramValue) {
    function isInt(value) {
      return (
        !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10))
      );
    }

    const enumOptions = [
      "foodlibrary",
      "presettemplate",
      "dishtemplate",
      "manualentry",
      "aiassistant",
      "temporaryai",
    ];
    if (typeof paramValue !== "string") {
      if (isInt(paramValue)) {
        paramValue = Number(paramValue);
        if (paramValue >= 0 && paramValue <= enumOptions.length - 1) {
          paramValue = enumOptions[paramValue];
          return paramValue;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    if (!enumOptions.includes(paramValue.toLowerCase())) {
      return false;
    }

    return true;
  }

  checkParameter_lineSource() {
    if (this.lineSource == null) {
      throw new BadRequestError("errMsg_lineSourceisRequired");
    }

    if (Array.isArray(this.lineSource)) {
      throw new BadRequestError("errMsg_lineSourceMustNotBeAnArray");
    }

    // Parameter Type: Enum

    const enumResult = this.checkParameterType_lineSource(this.lineSource);
    if (enumResult === false) {
      throw new BadRequestError("errMsg_lineSourceTypeIsNotValid");
    } else if (enumResult !== true) {
      this.lineSource = enumResult;
    }
  }

  checkParameterType_sourceFoodItemId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sourceFoodItemId() {
    if (this.sourceFoodItemId == null) return;

    if (Array.isArray(this.sourceFoodItemId)) {
      throw new BadRequestError("errMsg_sourceFoodItemIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_sourceFoodItemId(this.sourceFoodItemId)) {
      throw new BadRequestError("errMsg_sourceFoodItemIdTypeIsNotValid");
    }
  }

  checkParameterType_sourcePresetMealId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sourcePresetMealId() {
    if (this.sourcePresetMealId == null) return;

    if (Array.isArray(this.sourcePresetMealId)) {
      throw new BadRequestError("errMsg_sourcePresetMealIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_sourcePresetMealId(this.sourcePresetMealId)) {
      throw new BadRequestError("errMsg_sourcePresetMealIdTypeIsNotValid");
    }
  }

  checkParameterType_userId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userId() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (Array.isArray(this.userId)) {
      throw new BadRequestError("errMsg_userIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_userId(this.userId)) {
      throw new BadRequestError("errMsg_userIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.mealLineId === "") this.mealLineId = null;
    this.checkParameter_mealLineId();

    if (this.mealLogId === "") this.mealLogId = null;
    this.checkParameter_mealLogId();

    this.checkParameter_itemName();

    this.checkParameter_consumedGrams();

    this.checkParameter_itemCalories();

    this.checkParameter_itemProtein();

    this.checkParameter_itemCarbohydrates();

    this.checkParameter_itemFat();

    this.checkParameter_itemSugar();

    this.checkParameter_itemFiber();

    this.checkParameter_lineSource();

    if (this.sourceFoodItemId === "") this.sourceFoodItemId = null;
    this.checkParameter_sourceFoodItemId();

    if (this.sourcePresetMealId === "") this.sourcePresetMealId = null;
    this.checkParameter_sourcePresetMealId();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

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
    return await dbScriptCreateMealline(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.mealLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentMealLogForValidation =
        await this.fetchParentMealLogForValidation();
    } catch (err) {
      console.log("fetchParentMealLogForValidation Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.checkMealLogOwnership();
    } catch (err) {
      console.log("checkMealLogOwnership Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainCreateOperation() {
    try {
      await this.recalculateMealTotalsAfterLineCreate();
    } catch (err) {
      console.log(
        "recalculateMealTotalsAfterLineCreate Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
    try {
      await this.upsertNutritionDayAfterLineCreate();
    } catch (err) {
      console.log(
        "upsertNutritionDayAfterLineCreate Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Verifies that the referenced mealLog belongs to the calling user
   ***********************************************************************/

  async checkMealLogOwnership() {
    if (this.checkAbsolute()) return true;

    let isValid;
    try {
      isValid = runMScript(
        () =>
          this.parentMealLogForValidation &&
          this.parentMealLogForValidation.userId === this.session.userId,
        {
          path: "services[3].businessLogic[5].actions.validationActions[0].validationScript",
        },
      );
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
        `Validation 'checkMealLogOwnership' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new ForbiddenError("This meal log does not belong to you");
    }
    return isValid;
  }

  /***********************************************************************
   ** Fetches the parent mealLog to validate ownership and capture mealDate
   ***********************************************************************/
  async fetchParentMealLogForValidation() {
    // Fetch Object on childObject mealLog

    const userQuery = {
      id: runMScript(() => this.mealLogId, {
        path: "services[3].businessLogic[5].actions.fetchObjectActions[0].matchValue",
      }),
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getMealLogByQuery(scriptQuery);

    if (!data) {
      throw new NotFoundError("errMsg_FethcedObjectNotFound:mealLog");
    }

    return data;
  }

  /***********************************************************************
   ** Recomputes meal-level nutrition totals from all child lines
   ***********************************************************************/

  async recalculateMealTotalsAfterLineCreate() {
    try {
      return runMScript(() => LIB.recalculateMealTotals(this.mealLogId), {
        path: "services[3].businessLogic[5].actions.functionCallActions[0].callScript",
      });
    } catch (err) {
      console.error(
        "Error in FunctionCallAction recalculateMealTotalsAfterLineCreate:",
        err,
      );
      throw err;
    }
  }

  /***********************************************************************
   ** Updates the daily snapshot after new line is added
   ***********************************************************************/

  async upsertNutritionDayAfterLineCreate() {
    try {
      return runMScript(
        () =>
          LIB.upsertNutritionDay(
            this.session.userId,
            this.parentMealLogForValidation.mealDate,
          ),
        {
          path: "services[3].businessLogic[5].actions.functionCallActions[1].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction upsertNutritionDayAfterLineCreate:",
        err,
      );
      throw err;
    }
  }
}

module.exports = CreateMealLineManager;

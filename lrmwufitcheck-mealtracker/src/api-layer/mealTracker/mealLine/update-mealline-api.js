const { runMScript } = require("common");

const MealLineManager = require("./MealLineManager");

const {
  dbScriptUpdateMealline,
  getMealLineByQuery,
  getMealLogByQuery,
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

class UpdateMealLineManager extends MealLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateMealLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLineId = this.mealLineId;
    jsonObj.itemName = this.itemName;
    jsonObj.consumedGrams = this.consumedGrams;
    jsonObj.itemCalories = this.itemCalories;
    jsonObj.itemProtein = this.itemProtein;
    jsonObj.itemCarbohydrates = this.itemCarbohydrates;
    jsonObj.itemFat = this.itemFat;
    jsonObj.itemSugar = this.itemSugar;
    jsonObj.itemFiber = this.itemFiber;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLineId = request.params?.["mealLineId"];
    this.itemName = request.body?.["itemName"];
    this.consumedGrams = request.body?.["consumedGrams"];
    this.itemCalories = request.body?.["itemCalories"];
    this.itemProtein = request.body?.["itemProtein"];
    this.itemCarbohydrates = request.body?.["itemCarbohydrates"];
    this.itemFat = request.body?.["itemFat"];
    this.itemSugar = request.body?.["itemSugar"];
    this.itemFiber = request.body?.["itemFiber"];
    this.userId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.mealLineId = this.mealLineId ?? this.id;
    this.id = this.mealLineId;
  }

  readMcpParameters(request) {
    this.mealLineId = request.mcpParams?.["mealLineId"];
    this.itemName = request.mcpParams?.["itemName"];
    this.consumedGrams = request.mcpParams?.["consumedGrams"];
    this.itemCalories = request.mcpParams?.["itemCalories"];
    this.itemProtein = request.mcpParams?.["itemProtein"];
    this.itemCarbohydrates = request.mcpParams?.["itemCarbohydrates"];
    this.itemFat = request.mcpParams?.["itemFat"];
    this.itemSugar = request.mcpParams?.["itemSugar"];
    this.itemFiber = request.mcpParams?.["itemFiber"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.mealLineId = this.mealLineId ?? this.id;
    this.id = this.mealLineId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.mealLineId, userId: this.session.userId }),
      { path: "services[3].businessLogic[6].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  // data clause methods

  async buildDataClause() {
    const { hashString } = require("common");

    {
      const validateNutritionValues = require("../../../library/functions/validateNutritionValues");
      const mergedGrams = Number(this.consumedGrams ?? this.mealLine?.consumedGrams);
      const density = mergedGrams > 0 ? 100 / mergedGrams : 0;
      validateNutritionValues({
        caloriePer100g: Number(this.itemCalories ?? this.mealLine?.itemCalories) * density,
        proteinPer100g: Number(this.itemProtein ?? this.mealLine?.itemProtein) * density,
        carbohydratePer100g: Number(this.itemCarbohydrates ?? this.mealLine?.itemCarbohydrates) * density,
        fatPer100g: Number(this.itemFat ?? this.mealLine?.itemFat) * density,
        sugarPer100g: Number(this.itemSugar ?? this.mealLine?.itemSugar) * density,
        fiberPer100g: Number(this.itemFiber ?? this.mealLine?.itemFiber) * density,
      });
    }

    const dataClause = {
      itemName: runMScript(() => this.itemName, {
        path: "services[3].businessLogic[6].dataClauseItems[0].value",
      }),
      consumedGrams: runMScript(() => this.consumedGrams, {
        path: "services[3].businessLogic[6].dataClauseItems[1].value",
      }),
      itemCalories: runMScript(() => this.itemCalories, {
        path: "services[3].businessLogic[6].dataClauseItems[2].value",
      }),
      itemProtein: runMScript(() => this.itemProtein, {
        path: "services[3].businessLogic[6].dataClauseItems[3].value",
      }),
      itemCarbohydrates: runMScript(() => this.itemCarbohydrates, {
        path: "services[3].businessLogic[6].dataClauseItems[4].value",
      }),
      itemFat: runMScript(() => this.itemFat, {
        path: "services[3].businessLogic[6].dataClauseItems[5].value",
      }),
      itemSugar: runMScript(() => this.itemSugar, {
        path: "services[3].businessLogic[6].dataClauseItems[6].value",
      }),
      itemFiber: runMScript(() => this.itemFiber, {
        path: "services[3].businessLogic[6].dataClauseItems[7].value",
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

    // Round to 2 decimals - guards against floating-point artifacts (e.g.
    // 31.900000000002) from client-side per-gram multiplication.
    for (const _numKey of [
      "itemCalories",
      "itemProtein",
      "itemCarbohydrates",
      "itemFat",
      "itemSugar",
      "itemFiber",
    ]) {
      if (typeof dataClause[_numKey] === "number") {
        dataClause[_numKey] = Math.round(dataClause[_numKey] * 100) / 100;
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

  async fetchInstance() {
    const { getMealLineByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.mealLine = await getMealLineByQuery(this.whereClause);
    if (!this.mealLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.mealLine;
    this.instance = this.mealLine;
  }

  async checkInstance() {
    if (!this.mealLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    if (!this.checkAbsolute()) {
      // Owner-field safety net: if the resolved owner field on the record is
      // null/undefined, the isOwner comparison could never succeed — either
      // the spec is missing a sessionSettings.isOwnerField property (so the
      // codegen wired the synthetic "_owner" column that does not exist), or
      // the record was written without the owner column. Throw a distinct,
      // attributable 403 instead of the misleading "wrong user" message that
      // sends operators chasing user-identity bugs that are really config bugs.
      if (this.mealLine?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_mealLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealLineId() {
    if (this.mealLineId == null) {
      throw new BadRequestError("errMsg_mealLineIdisRequired");
    }

    if (Array.isArray(this.mealLineId)) {
      throw new BadRequestError("errMsg_mealLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_mealLineId(this.mealLineId)) {
      throw new BadRequestError("errMsg_mealLineIdTypeIsNotValid");
    }
  }

  checkParameter_itemName() {
    if (this.itemName == null) return;

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
    if (this.consumedGrams == null) return;

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
    if (this.itemCalories == null) return;

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
    if (this.itemProtein == null) return;

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
    if (this.itemCarbohydrates == null) return;

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
    if (this.itemFat == null) return;

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
    if (this.itemSugar == null) return;

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
    if (this.itemFiber == null) return;

    if (Array.isArray(this.itemFiber)) {
      throw new BadRequestError("errMsg_itemFiberMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_itemFiber(this.itemFiber)) {
      throw new BadRequestError("errMsg_itemFiberTypeIsNotValid");
    }
  }

  checkParameterType_userId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userId() {
    if (this.userId == null) return;

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

    this.checkParameter_itemName();

    this.checkParameter_consumedGrams();

    this.checkParameter_itemCalories();

    this.checkParameter_itemProtein();

    this.checkParameter_itemCarbohydrates();

    this.checkParameter_itemFat();

    this.checkParameter_itemSugar();

    this.checkParameter_itemFiber();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.mealLine?.userId === this.session.userId;
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
    return await dbScriptUpdateMealline(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.mealLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      this.existingLine = await this.fetchExistingLine();
    } catch (err) {
      console.log("fetchExistingLine Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.parentMealLog = await this.fetchParentMealLogForLineUpdate();
    } catch (err) {
      console.log("fetchParentMealLogForLineUpdate Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      await this.recalculateMealTotalsAfterLineUpdate();
    } catch (err) {
      console.log(
        "recalculateMealTotalsAfterLineUpdate Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
    try {
      await this.upsertNutritionDayAfterLineUpdate();
    } catch (err) {
      console.log(
        "upsertNutritionDayAfterLineUpdate Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Fetches the mealLine to get its mealLogId
   ***********************************************************************/
  async fetchExistingLine() {
    // Fetch Object on childObject mealLine

    const userQuery = {
      id: runMScript(() => this.mealLineId, {
        path: "services[3].businessLogic[6].actions.fetchObjectActions[0].matchValue",
      }),
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getMealLineByQuery(scriptQuery);

    if (!data) {
      throw new NotFoundError("errMsg_FethcedObjectNotFound:mealLine");
    }

    return data;
  }

  /***********************************************************************
   ** Fetches the parent mealLog to get mealDate for nutrition day upsert
   ***********************************************************************/
  async fetchParentMealLogForLineUpdate() {
    // Fetch Object on childObject mealLog

    const userQuery = {
      id: runMScript(() => this.existingLine.mealLogId, {
        path: "services[3].businessLogic[6].actions.fetchObjectActions[1].matchValue",
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
   ** Recomputes meal-level nutrition totals after line update
   ***********************************************************************/

  async recalculateMealTotalsAfterLineUpdate() {
    try {
      return runMScript(
        () => LIB.recalculateMealTotals(this.existingLine.mealLogId),
        {
          path: "services[3].businessLogic[6].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction recalculateMealTotalsAfterLineUpdate:",
        err,
      );
      throw err;
    }
  }

  /***********************************************************************
   ** Refreshes daily snapshot after line update
   ***********************************************************************/

  async upsertNutritionDayAfterLineUpdate() {
    try {
      return runMScript(
        () =>
          LIB.upsertNutritionDay(
            this.session.userId,
            this.parentMealLog.mealDate,
          ),
        {
          path: "services[3].businessLogic[6].actions.functionCallActions[1].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction upsertNutritionDayAfterLineUpdate:",
        err,
      );
      throw err;
    }
  }
}

module.exports = UpdateMealLineManager;

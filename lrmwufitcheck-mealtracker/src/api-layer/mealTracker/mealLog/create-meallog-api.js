const { runMScript } = require("common");

const MealLogManager = require("./MealLogManager");

const { dbScriptCreateMeallog, createMealLine } = require("dbLayer");
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
const { MeallogCreatedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class CreateMealLogManager extends MealLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createMealLog",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLog";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLogId = this.mealLogId;
    jsonObj.mealDate = this.mealDate;
    jsonObj.mealTime = this.mealTime;
    jsonObj.slotName = this.slotName;
    jsonObj.logSource = this.logSource;
    jsonObj.noteText = this.noteText;
    jsonObj.totalCalories = this.totalCalories;
    jsonObj.totalProtein = this.totalProtein;
    jsonObj.totalCarbohydrates = this.totalCarbohydrates;
    jsonObj.totalFat = this.totalFat;
    jsonObj.totalSugar = this.totalSugar;
    jsonObj.totalFiber = this.totalFiber;
    jsonObj.lines = this.lines;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLogId = request.body?.["mealLogId"];
    this.mealDate = request.body?.["mealDate"];
    this.mealTime = request.body?.["mealTime"];
    this.slotName = request.body?.["slotName"];
    this.logSource = request.body?.["logSource"];
    this.noteText = request.body?.["noteText"];
    this.totalCalories = request.body?.["totalCalories"];
    this.totalProtein = request.body?.["totalProtein"];
    this.totalCarbohydrates = request.body?.["totalCarbohydrates"];
    this.totalFat = request.body?.["totalFat"];
    this.totalSugar = request.body?.["totalSugar"];
    this.totalFiber = request.body?.["totalFiber"];
    this.lines = request.body?.["lines"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.mealLogId = this.mealLogId ?? this.id;
    this.id = this.mealLogId;
  }

  readMcpParameters(request) {
    this.mealLogId = request.mcpParams?.["mealLogId"];
    this.mealDate = request.mcpParams?.["mealDate"];
    this.mealTime = request.mcpParams?.["mealTime"];
    this.slotName = request.mcpParams?.["slotName"];
    this.logSource = request.mcpParams?.["logSource"];
    this.noteText = request.mcpParams?.["noteText"];
    this.totalCalories = request.mcpParams?.["totalCalories"];
    this.totalProtein = request.mcpParams?.["totalProtein"];
    this.totalCarbohydrates = request.mcpParams?.["totalCarbohydrates"];
    this.totalFat = request.mcpParams?.["totalFat"];
    this.totalSugar = request.mcpParams?.["totalSugar"];
    this.totalFiber = request.mcpParams?.["totalFiber"];
    this.lines = request.mcpParams?.["lines"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.mealLogId = this.mealLogId ?? this.id;
    this.id = this.mealLogId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.mealLogId = this.id;
    if (!this.mealLogId) this.mealLogId = newUUID(false);
    this.id = this.mealLogId;

    const dataClause = {
      id: this.mealLogId,
      userId: this.userId,
      mealDate: runMScript(() => this.mealDate, {
        path: "services[3].businessLogic[0].dataClauseItems[0].value",
      }),
      mealTime: runMScript(() => this.mealTime, {
        path: "services[3].businessLogic[0].dataClauseItems[1].value",
      }),
      slotName: runMScript(() => this.slotName, {
        path: "services[3].businessLogic[0].dataClauseItems[2].value",
      }),
      logSource: runMScript(() => this.logSource, {
        path: "services[3].businessLogic[0].dataClauseItems[3].value",
      }),
      noteText: runMScript(() => this.noteText || null, {
        path: "services[3].businessLogic[0].dataClauseItems[4].value",
      }),
      totalCalories: runMScript(() => this.totalCalories, {
        path: "services[3].businessLogic[0].dataClauseItems[5].value",
      }),
      totalProtein: runMScript(() => this.totalProtein, {
        path: "services[3].businessLogic[0].dataClauseItems[6].value",
      }),
      totalCarbohydrates: runMScript(() => this.totalCarbohydrates, {
        path: "services[3].businessLogic[0].dataClauseItems[7].value",
      }),
      totalFat: runMScript(() => this.totalFat, {
        path: "services[3].businessLogic[0].dataClauseItems[8].value",
      }),
      totalSugar: runMScript(() => this.totalSugar, {
        path: "services[3].businessLogic[0].dataClauseItems[9].value",
      }),
      totalFiber: runMScript(() => this.totalFiber, {
        path: "services[3].businessLogic[0].dataClauseItems[10].value",
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

    // Round nutrition totals to 2 decimals - the client sums per-item floats
    // client-side, which can produce artifacts like 31.900000000002. This
    // path (batch creation with an inline `lines` array) never goes through
    // recalculateMealTotals afterward, so it's the only place these totals
    // get persisted - round here rather than trusting the client value as-is.
    for (const _numKey of [
      "totalCalories",
      "totalProtein",
      "totalCarbohydrates",
      "totalFat",
      "totalSugar",
      "totalFiber",
    ]) {
      if (typeof dataClause[_numKey] === "number") {
        dataClause[_numKey] = Math.round(dataClause[_numKey] * 100) / 100;
      }
    }

    // ID-typed dataClause fields strict-validation
    {
      const { isValidUUID } = require("common");
      const _idValidator = isValidUUID;
      const _idFieldsAndIsArray = [["userId", false]];
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

  checkParameterType_mealLogId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealLogId() {
    if (this.mealLogId == null) return;

    if (Array.isArray(this.mealLogId)) {
      throw new BadRequestError("errMsg_mealLogIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_mealLogId(this.mealLogId)) {
      throw new BadRequestError("errMsg_mealLogIdTypeIsNotValid");
    }
  }

  checkParameterType_mealDate(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealDate() {
    if (this.mealDate == null) {
      throw new BadRequestError("errMsg_mealDateisRequired");
    }

    if (Array.isArray(this.mealDate)) {
      throw new BadRequestError("errMsg_mealDateMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_mealDate(this.mealDate)) {
      throw new BadRequestError("errMsg_mealDateTypeIsNotValid");
    }
  }

  checkParameter_mealTime() {
    if (this.mealTime == null) {
      throw new BadRequestError("errMsg_mealTimeisRequired");
    }

    if (Array.isArray(this.mealTime)) {
      throw new BadRequestError("errMsg_mealTimeMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_slotName() {
    if (this.slotName == null) {
      throw new BadRequestError("errMsg_slotNameisRequired");
    }

    if (Array.isArray(this.slotName)) {
      throw new BadRequestError("errMsg_slotNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_logSource(paramValue) {
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

  checkParameter_logSource() {
    if (this.logSource == null) {
      throw new BadRequestError("errMsg_logSourceisRequired");
    }

    if (Array.isArray(this.logSource)) {
      throw new BadRequestError("errMsg_logSourceMustNotBeAnArray");
    }

    // Parameter Type: Enum

    const enumResult = this.checkParameterType_logSource(this.logSource);
    if (enumResult === false) {
      throw new BadRequestError("errMsg_logSourceTypeIsNotValid");
    } else if (enumResult !== true) {
      this.logSource = enumResult;
    }
  }

  checkParameter_noteText() {
    if (this.noteText == null) return;

    if (Array.isArray(this.noteText)) {
      throw new BadRequestError("errMsg_noteTextMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_totalCalories(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_totalCalories() {
    if (this.totalCalories == null) {
      throw new BadRequestError("errMsg_totalCaloriesisRequired");
    }

    if (Array.isArray(this.totalCalories)) {
      throw new BadRequestError("errMsg_totalCaloriesMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalCalories(this.totalCalories)) {
      throw new BadRequestError("errMsg_totalCaloriesTypeIsNotValid");
    }
  }

  checkParameterType_totalProtein(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_totalProtein() {
    if (this.totalProtein == null) {
      throw new BadRequestError("errMsg_totalProteinisRequired");
    }

    if (Array.isArray(this.totalProtein)) {
      throw new BadRequestError("errMsg_totalProteinMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalProtein(this.totalProtein)) {
      throw new BadRequestError("errMsg_totalProteinTypeIsNotValid");
    }
  }

  checkParameterType_totalCarbohydrates(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_totalCarbohydrates() {
    if (this.totalCarbohydrates == null) {
      throw new BadRequestError("errMsg_totalCarbohydratesisRequired");
    }

    if (Array.isArray(this.totalCarbohydrates)) {
      throw new BadRequestError("errMsg_totalCarbohydratesMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalCarbohydrates(this.totalCarbohydrates)) {
      throw new BadRequestError("errMsg_totalCarbohydratesTypeIsNotValid");
    }
  }

  checkParameterType_totalFat(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_totalFat() {
    if (this.totalFat == null) {
      throw new BadRequestError("errMsg_totalFatisRequired");
    }

    if (Array.isArray(this.totalFat)) {
      throw new BadRequestError("errMsg_totalFatMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalFat(this.totalFat)) {
      throw new BadRequestError("errMsg_totalFatTypeIsNotValid");
    }
  }

  checkParameterType_totalSugar(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_totalSugar() {
    if (this.totalSugar == null) {
      throw new BadRequestError("errMsg_totalSugarisRequired");
    }

    if (Array.isArray(this.totalSugar)) {
      throw new BadRequestError("errMsg_totalSugarMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalSugar(this.totalSugar)) {
      throw new BadRequestError("errMsg_totalSugarTypeIsNotValid");
    }
  }

  checkParameterType_totalFiber(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_totalFiber() {
    if (this.totalFiber == null) {
      throw new BadRequestError("errMsg_totalFiberisRequired");
    }

    if (Array.isArray(this.totalFiber)) {
      throw new BadRequestError("errMsg_totalFiberMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalFiber(this.totalFiber)) {
      throw new BadRequestError("errMsg_totalFiberTypeIsNotValid");
    }
  }

  checkParameterType_lines(paramValue) {
    if (typeof paramValue !== "object") {
      return false;
    }

    return true;
  }

  checkParameter_lines() {
    if (this.lines == null) {
      // Lines are optional at creation time: mealLine rows can also be
      // added afterward via the standalone POST /v1/meal-lines endpoint
      // (e.g. nutritionAi's confirm-candidatemeal flow creates the log
      // first, then adds each line individually).
      this.lines = [];
      return;
    }

    if (!Array.isArray(this.lines)) {
      throw new BadRequestError("errMsg_linesMustBeAnArray");
    }

    // Parameter Type: Object

    this.lines.forEach((item) => {
      if (!this.checkParameterType_lines(item)) {
        throw new BadRequestError("errMsg_linesArrayHasAnInvalidItem");
      }
    });

    const validateNutritionValues = require("../../../library/functions/validateNutritionValues");
    this.lines.forEach((item) => {
      const grams = Number(item.consumedGrams);
      const density = grams > 0 ? 100 / grams : 0;
      validateNutritionValues({
        caloriePer100g: Number(item.itemCalories) * density,
        proteinPer100g: Number(item.itemProtein) * density,
        carbohydratePer100g: Number(item.itemCarbohydrates) * density,
        fatPer100g: Number(item.itemFat) * density,
        sugarPer100g: Number(item.itemSugar) * density,
        fiberPer100g: Number(item.itemFiber) * density,
      });
    });
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
    if (this.mealLogId === "") this.mealLogId = null;
    this.checkParameter_mealLogId();

    this.checkParameter_mealDate();

    this.checkParameter_mealTime();

    this.checkParameter_slotName();

    this.checkParameter_logSource();

    this.checkParameter_noteText();

    this.checkParameter_totalCalories();

    this.checkParameter_totalProtein();

    this.checkParameter_totalCarbohydrates();

    this.checkParameter_totalFat();

    this.checkParameter_totalSugar();

    this.checkParameter_totalFiber();

    this.checkParameter_lines();

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
    return await dbScriptCreateMeallog(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.mealLog, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    MeallogCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  async afterMainCreateOperation() {
    try {
      await this.loopOverLines();
    } catch (err) {
      console.log("loopOverLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.nutritionDayResult = await this.upsertNutritionDayAfterCreate();
    } catch (err) {
      console.log("upsertNutritionDayAfterCreate Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Iterates over the lines array and creates a mealLine record for each
   ** item
   ***********************************************************************/

  async runStep_loopOverLines(lineItem, stepIndex, stepResults) {
    const stepResult_createMealLineItem = await this.createMealLineItem(
      lineItem,
      stepIndex,
      stepResults,
      lineItem,
    );
    stepResults[`createMealLineItem_${stepIndex}`] =
      stepResult_createMealLineItem;

    if (lineItem != null && typeof lineItem == "object") {
      lineItem.createdLine = stepResult_createMealLineItem;
    } else {
      this.createdLine = stepResult_createMealLineItem;
    }
  }

  async loopOverLines() {
    // Loop Action
    const loopList = runMScript(() => this.lines, {
      path: "services[3].businessLogic[0].actions.loopActions[0].loopFor",
    });

    const stpResults = {};

    let stpIndex = 0;
    for (const lineItem of loopList) {
      await this.runStep_loopOverLines(lineItem, stpIndex++, stpResults);
    }

    return loopList.length;
  }

  /***********************************************************************
   ** Creates a mealLine row for each item in the lines array during loop
   ** iteration
   ***********************************************************************/
  async createMealLineItem(lineItem, stepIndex, stepResults, crudItem) {
    // Aggregated Update Operation on childObject mealLine

    const params = {
      mealLogId: runMScript(() => this.mealLog.id, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      userId: runMScript(() => this.session.userId, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[1].dataValue",
      }),
      itemName: runMScript(() => lineItem.itemName, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[2].dataValue",
      }),
      consumedGrams: runMScript(() => lineItem.consumedGrams, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[3].dataValue",
      }),
      itemCalories: runMScript(() => lineItem.itemCalories, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[4].dataValue",
      }),
      itemProtein: runMScript(() => lineItem.itemProtein, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[5].dataValue",
      }),
      itemCarbohydrates: runMScript(() => lineItem.itemCarbohydrates, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[6].dataValue",
      }),
      itemFat: runMScript(() => lineItem.itemFat, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[7].dataValue",
      }),
      itemSugar: runMScript(() => lineItem.itemSugar, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[8].dataValue",
      }),
      itemFiber: runMScript(() => lineItem.itemFiber, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[9].dataValue",
      }),
      lineSource: runMScript(() => lineItem.lineSource, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[10].dataValue",
      }),
      sourceFoodItemId: runMScript(() => lineItem.sourceFoodItemId || null, {
        path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[11].dataValue",
      }),
      sourcePresetMealId: runMScript(
        () => lineItem.sourcePresetMealId || null,
        {
          path: "services[3].businessLogic[0].actions.createCrudActions[0].dataClause[12].dataValue",
        },
      ),
      // Not part of the original generated dataClause (no matching
      // businessLogic path) - the frontend's dishTemplate confirm flow
      // already sends this, but it was previously silently dropped since
      // no column existed to persist it into.
      sourceDishId: lineItem.sourceDishId || null,
    };

    // Round to 2 decimals - same floating-point artifact guard as the
    // parent mealLog's totals (see buildDataClause above).
    for (const _numKey of [
      "itemCalories",
      "itemProtein",
      "itemCarbohydrates",
      "itemFat",
      "itemSugar",
      "itemFiber",
    ]) {
      if (typeof params[_numKey] === "number") {
        params[_numKey] = Math.round(params[_numKey] * 100) / 100;
      }
    }

    return await createMealLine(params, this);
  }

  /***********************************************************************
   ** Upserts the nutritionDay record after meal log and lines are created
   ***********************************************************************/

  async upsertNutritionDayAfterCreate() {
    try {
      return runMScript(
        () => LIB.upsertNutritionDay(this.session.userId, this.mealDate),
        {
          path: "services[3].businessLogic[0].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction upsertNutritionDayAfterCreate:",
        err,
      );
      throw err;
    }
  }
}

module.exports = CreateMealLogManager;

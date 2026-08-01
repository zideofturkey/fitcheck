const { runMScript } = require("common");

const MealLogManager = require("./MealLogManager");

const { dbScriptUpdateMeallog, getMealLogByQuery } = require("dbLayer");
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

class UpdateMealLogManager extends MealLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateMealLog",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
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
    jsonObj.noteText = this.noteText;
    jsonObj.totalCalories = this.totalCalories;
    jsonObj.totalProtein = this.totalProtein;
    jsonObj.totalCarbohydrates = this.totalCarbohydrates;
    jsonObj.totalFat = this.totalFat;
    jsonObj.totalSugar = this.totalSugar;
    jsonObj.totalFiber = this.totalFiber;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLogId = request.params?.["mealLogId"];
    this.mealDate = request.body?.["mealDate"];
    this.mealTime = request.body?.["mealTime"];
    this.slotName = request.body?.["slotName"];
    this.noteText = request.body?.["noteText"];
    this.totalCalories = request.body?.["totalCalories"];
    this.totalProtein = request.body?.["totalProtein"];
    this.totalCarbohydrates = request.body?.["totalCarbohydrates"];
    this.totalFat = request.body?.["totalFat"];
    this.totalSugar = request.body?.["totalSugar"];
    this.totalFiber = request.body?.["totalFiber"];
    this.userId = request.session?.["userId"];
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
    this.noteText = request.mcpParams?.["noteText"];
    this.totalCalories = request.mcpParams?.["totalCalories"];
    this.totalProtein = request.mcpParams?.["totalProtein"];
    this.totalCarbohydrates = request.mcpParams?.["totalCarbohydrates"];
    this.totalFat = request.mcpParams?.["totalFat"];
    this.totalSugar = request.mcpParams?.["totalSugar"];
    this.totalFiber = request.mcpParams?.["totalFiber"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.mealLogId = this.mealLogId ?? this.id;
    this.id = this.mealLogId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.mealLogId, userId: this.session.userId }),
      { path: "services[3].businessLogic[3].whereClause.fullWhereClause" },
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

    const dataClause = {
      // Pass an actual Date instance, not the raw "YYYY-MM-DD" string:
      // Sequelize's DATE serializer re-parses plain strings using local-
      // timezone semantics, which silently shifts the value by the host's
      // UTC offset (see the identical fix in mealTracker's getdailyprogress
      // and upsertNutritionDay).
      mealDate: this.mealDate != null ? new Date(this.mealDate) : this.mealDate,
      mealTime: runMScript(() => this.mealTime, {
        path: "services[3].businessLogic[3].dataClauseItems[0].value",
      }),
      slotName: runMScript(() => this.slotName, {
        path: "services[3].businessLogic[3].dataClauseItems[1].value",
      }),
      noteText: runMScript(() => this.noteText, {
        path: "services[3].businessLogic[3].dataClauseItems[2].value",
      }),
      totalCalories: runMScript(() => this.totalCalories, {
        path: "services[3].businessLogic[3].dataClauseItems[3].value",
      }),
      totalProtein: runMScript(() => this.totalProtein, {
        path: "services[3].businessLogic[3].dataClauseItems[4].value",
      }),
      totalCarbohydrates: runMScript(() => this.totalCarbohydrates, {
        path: "services[3].businessLogic[3].dataClauseItems[5].value",
      }),
      totalFat: runMScript(() => this.totalFat, {
        path: "services[3].businessLogic[3].dataClauseItems[6].value",
      }),
      totalSugar: runMScript(() => this.totalSugar, {
        path: "services[3].businessLogic[3].dataClauseItems[7].value",
      }),
      totalFiber: runMScript(() => this.totalFiber, {
        path: "services[3].businessLogic[3].dataClauseItems[8].value",
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

  async fetchInstance() {
    const { getMealLogByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.mealLog = await getMealLogByQuery(this.whereClause);
    if (!this.mealLog) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.mealLog;
    this.instance = this.mealLog;
  }

  async checkInstance() {
    if (!this.mealLog) {
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
      if (this.mealLog?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
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

  checkParameterType_mealDate(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealDate() {
    if (this.mealDate == null) return;

    if (Array.isArray(this.mealDate)) {
      throw new BadRequestError("errMsg_mealDateMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_mealDate(this.mealDate)) {
      throw new BadRequestError("errMsg_mealDateTypeIsNotValid");
    }
  }

  checkParameter_mealTime() {
    if (this.mealTime == null) return;

    if (Array.isArray(this.mealTime)) {
      throw new BadRequestError("errMsg_mealTimeMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_slotName() {
    if (this.slotName == null) return;

    if (Array.isArray(this.slotName)) {
      throw new BadRequestError("errMsg_slotNameMustNotBeAnArray");
    }

    // Parameter Type: String
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
    if (this.totalCalories == null) return;

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
    if (this.totalProtein == null) return;

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
    if (this.totalCarbohydrates == null) return;

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
    if (this.totalFat == null) return;

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
    if (this.totalSugar == null) return;

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
    if (this.totalFiber == null) return;

    if (Array.isArray(this.totalFiber)) {
      throw new BadRequestError("errMsg_totalFiberMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_totalFiber(this.totalFiber)) {
      throw new BadRequestError("errMsg_totalFiberTypeIsNotValid");
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
    if (this.mealLogId === "") this.mealLogId = null;
    this.checkParameter_mealLogId();

    this.checkParameter_mealDate();

    this.checkParameter_mealTime();

    this.checkParameter_slotName();

    this.checkParameter_noteText();

    this.checkParameter_totalCalories();

    this.checkParameter_totalProtein();

    this.checkParameter_totalCarbohydrates();

    this.checkParameter_totalFat();

    this.checkParameter_totalSugar();

    this.checkParameter_totalFiber();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.mealLog?.userId === this.session.userId;
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
    return await dbScriptUpdateMeallog(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.mealLog, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      this.existingMealLog = await this.fetchExistingMealLog();
    } catch (err) {
      console.log("fetchExistingMealLog Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      this.nutritionDayResult = await this.upsertNutritionDayAfterUpdate();
    } catch (err) {
      console.log("upsertNutritionDayAfterUpdate Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Fetches the existing mealLog to capture mealDate for nutrition day
   ** upsert
   ***********************************************************************/
  async fetchExistingMealLog() {
    // Fetch Object on childObject mealLog

    const userQuery = {
      id: runMScript(() => this.mealLogId, {
        path: "services[3].businessLogic[3].actions.fetchObjectActions[0].matchValue",
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
   ** Recomputes the nutritionDay record after meal log update
   ***********************************************************************/

  async upsertNutritionDayAfterUpdate() {
    try {
      const oldDate = this.existingMealLog?.mealDate;
      const newDate = this.mealLog?.mealDate ?? oldDate;

      const result = await LIB.upsertNutritionDay(this.session.userId, newDate);

      // mealDate is now editable (see checkParameter_mealDate): if it
      // changed, the *old* day's cached totals are stale too - they still
      // include this meal's calories even though the row moved away from
      // that date. Recompute it as well so neither day's aggregate drifts.
      if (
        oldDate &&
        newDate &&
        new Date(oldDate).getTime() !== new Date(newDate).getTime()
      ) {
        await LIB.upsertNutritionDay(this.session.userId, oldDate);
      }

      return result;
    } catch (err) {
      console.error(
        "Error in FunctionCallAction upsertNutritionDayAfterUpdate:",
        err,
      );
      throw err;
    }
  }
}

module.exports = UpdateMealLogManager;

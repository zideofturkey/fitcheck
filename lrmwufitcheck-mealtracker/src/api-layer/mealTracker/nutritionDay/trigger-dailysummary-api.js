const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptTriggerDailysummary } = require("dbLayer");
const { ElasticIndexer, ServicePublisher } = require("serviceCommon");
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

class TriggerDailySummaryManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "triggerDailySummary",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "nutritionDay";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.userId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ summaryDate: LIB.todayDate() }), {
      path: "services[3].businessLogic[15].whereClause.fullWhereClause",
    });

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

    const dataClause = {};

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
    const { getNutritionDayByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.nutritionDay = await getNutritionDayByQuery(this.whereClause);
    if (!this.nutritionDay) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.nutritionDay;
    this.instance = this.nutritionDay;
  }

  async checkInstance() {
    if (!this.nutritionDay) {
      throw new NotFoundError("errMsg_RecordNotFound");
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
    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.nutritionDay?.userId === this.session.userId;
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("admin") || this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptTriggerDailysummary(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.nutritionDay, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterMainUpdateOperation() {
    try {
      this.summaryDays = await this.getUsersWithMealsToday();
    } catch (err) {
      console.log("getUsersWithMealsToday Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.loopSummaryDays();
    } catch (err) {
      console.log("loopSummaryDays Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Iterates over summary days and publishes a summary event for each user
   ***********************************************************************/

  async runStep_loopSummaryDays(summaryDay, stepIndex, stepResults) {
    const stepResult_publishSummaryEvent = await this.publishSummaryEvent(
      summaryDay,
      stepIndex,
      stepResults,
      summaryDay,
    );
    stepResults[`publishSummaryEvent_${stepIndex}`] =
      stepResult_publishSummaryEvent;
  }

  async loopSummaryDays() {
    // Loop Action
    const loopList = runMScript(() => this.summaryDays, {
      path: "services[3].businessLogic[15].actions.loopActions[0].loopFor",
    });

    const stpResults = {};

    let stpIndex = 0;
    for (const summaryDay of loopList) {
      await this.runStep_loopSummaryDays(summaryDay, stpIndex++, stpResults);
    }

    return loopList.length;
  }

  /***********************************************************************
   ** Returns nutritionDay rows for today where mealCount > 0
   ***********************************************************************/

  async getUsersWithMealsToday() {
    try {
      return runMScript(() => LIB.getUsersWithMealsToday(), {
        path: "services[3].businessLogic[15].actions.functionCallActions[0].callScript",
      });
    } catch (err) {
      console.error("Error in FunctionCallAction getUsersWithMealsToday:", err);
      throw err;
    }
  }

  /***********************************************************************
   ** Publishes daily summary Kafka event for a single user
   ***********************************************************************/
  async publishSummaryEvent(summaryDay, stepIndex, stepResults, crudItem) {
    const message = {
      userId: summaryDay.userId,
      summaryDate: summaryDay.summaryDate,
      consumedCalories: summaryDay.consumedCalories,
      consumedProtein: summaryDay.consumedProtein,
      consumedCarbohydrates: summaryDay.consumedCarbohydrates,
      consumedFat: summaryDay.consumedFat,
      consumedSugar: summaryDay.consumedSugar,
      consumedFiber: summaryDay.consumedFiber,
      targetCalories: summaryDay.targetCalories,
      targetProtein: summaryDay.targetProtein,
      targetCarbohydrates: summaryDay.targetCarbohydrates,
      targetFat: summaryDay.targetFat,
      targetSugar: summaryDay.targetSugar,
      targetFiber: summaryDay.targetFiber,
      exceededMetrics: summaryDay.exceededMetrics,
      mealCount: summaryDay.mealCount,
    };

    // Publish event to the configured topic
    const _publisher = new ServicePublisher(
      "fitcheck.meal.daily-summary",
      message,
      this.session,
      this.requestId,
    );
    await _publisher.publish();
    return true;
  }
}

module.exports = TriggerDailySummaryManager;

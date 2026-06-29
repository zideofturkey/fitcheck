const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptTriggerDailyremindercheck } = require("dbLayer");
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

class TriggerDailyReminderCheckManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "triggerDailyReminderCheck",
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
      path: "services[3].businessLogic[14].whereClause.fullWhereClause",
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
    return await dbScriptTriggerDailyremindercheck(this);

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
      this.usersToRemind = await this.getUsersWithNoMealsToday();
    } catch (err) {
      console.log("getUsersWithNoMealsToday Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.loopUsersToRemind();
    } catch (err) {
      console.log("loopUsersToRemind Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Iterates over users with no meals today and publishes a reminder event
   ** for each
   ***********************************************************************/

  async runStep_loopUsersToRemind(reminderUser, stepIndex, stepResults) {
    const stepResult_publishReminderEvent = await this.publishReminderEvent(
      reminderUser,
      stepIndex,
      stepResults,
      reminderUser,
    );
    stepResults[`publishReminderEvent_${stepIndex}`] =
      stepResult_publishReminderEvent;
  }

  async loopUsersToRemind() {
    // Loop Action
    const loopList = runMScript(() => this.usersToRemind, {
      path: "services[3].businessLogic[14].actions.loopActions[0].loopFor",
    });

    const stpResults = {};

    let stpIndex = 0;
    for (const reminderUser of loopList) {
      await this.runStep_loopUsersToRemind(
        reminderUser,
        stpIndex++,
        stpResults,
      );
    }

    return loopList.length;
  }

  /***********************************************************************
   ** Returns list of users with no meals logged today
   ***********************************************************************/

  async getUsersWithNoMealsToday() {
    try {
      return runMScript(() => LIB.getUsersWithNoMealsToday(), {
        path: "services[3].businessLogic[14].actions.functionCallActions[0].callScript",
      });
    } catch (err) {
      console.error(
        "Error in FunctionCallAction getUsersWithNoMealsToday:",
        err,
      );
      throw err;
    }
  }

  /***********************************************************************
   ** Publishes daily reminder Kafka event for a single user
   ***********************************************************************/
  async publishReminderEvent(reminderUser, stepIndex, stepResults, crudItem) {
    const message = {
      userId: reminderUser.userId,
      fullName: reminderUser.fullName,
      email: reminderUser.email,
      todayDate: reminderUser.todayDate,
    };

    // Publish event to the configured topic
    const _publisher = new ServicePublisher(
      "fitcheck.meal.daily-reminder",
      message,
      this.session,
      this.requestId,
    );
    await _publisher.publish();
    return true;
  }
}

module.exports = TriggerDailyReminderCheckManager;

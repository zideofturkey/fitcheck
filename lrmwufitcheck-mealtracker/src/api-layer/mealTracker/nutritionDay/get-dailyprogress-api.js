const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptGetDailyprogress } = require("dbLayer");
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

class GetDailyProgressManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getDailyProgress",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "nutritionDay";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.targetDate = this.targetDate;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.targetDate = request.query?.["targetDate"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.targetDate = request.mcpParams?.["targetDate"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ userId: this.session.userId, summaryDate: this.targetDate }),
      { path: "services[3].businessLogic[9].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.nutritionDay) {
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
      if (this.nutritionDay?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_targetDate(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_targetDate() {
    if (this.targetDate == null) return;

    if (Array.isArray(this.targetDate)) {
      throw new BadRequestError("errMsg_targetDateMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_targetDate(this.targetDate)) {
      throw new BadRequestError("errMsg_targetDateTypeIsNotValid");
    }
  }

  checkParameters() {
    this.checkParameter_targetDate();

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
    if (this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptGetDailyprogress(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.nutritionDay, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.targetDate = await this.setTargetDate();
    } catch (err) {
      console.log("setTargetDate Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainGetOperation() {
    try {
      if (
        runMScript(() => !this.nutritionDay, {
          path: "services[3].businessLogic[9].actions.functionCallActions[0].condition",
        })
      )
        this.nutritionDay = await this.initNutritionDayIfMissing();
    } catch (err) {
      console.log("initNutritionDayIfMissing Action Error:", err.message);
      //**errorLog
      this.initNutritionDayIfMissingError = err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Sets targetDate to the provided value or defaults to today's date
   ***********************************************************************/
  async setTargetDate() {
    try {
      this["targetDate"] = runMScript(
        () => this.targetDate || LIB.todayDate(),
        {
          path: "services[3].businessLogic[9].actions.addToContextActions[0].context[0].contextValue",
        },
      );

      return true;
    } catch (error) {
      console.error("AddToContextAction error:", error);
      throw error;
    }
  }

  /***********************************************************************
   ** Initializes a nutritionDay record if none exists for this user+date
   ***********************************************************************/

  async initNutritionDayIfMissing() {
    try {
      return runMScript(
        () => LIB.upsertNutritionDay(this.session.userId, this.targetDate),
        {
          path: "services[3].businessLogic[9].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction initNutritionDayIfMissing:",
        err,
      );
      throw err;
    }
  }
}

module.exports = GetDailyProgressManager;

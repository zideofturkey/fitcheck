const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptGetMonthlyanalytics } = require("dbLayer");
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

class GetMonthlyAnalyticsManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getMonthlyAnalytics",
      controllerType: controllerType,
      pagination: false,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "nutritionDays";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.referenceDate = this.referenceDate;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.referenceDate = request.query?.["referenceDate"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.referenceDate = request.mcpParams?.["referenceDate"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    // The nutritionDays list output only needs to cover the current 30-day
    // window shown on the page; the previous-period comparison data is
    // fetched separately inside buildMonthlyAnalyticsData() below. Pass
    // actual Date instances (and an exclusive upper bound) rather than raw
    // "YYYY-MM-DD" strings: Sequelize's DATE serializer re-parses plain
    // date strings using local-timezone semantics, which silently shifts
    // the value by the host's UTC offset and can drop the row stored at
    // true UTC midnight for the reference date itself.
    const refDate = this.referenceDate || LIB.todayDate();
    const start = LIB.daysAgo(29, refDate);
    const endExclusive = LIB.daysAgo(-1, refDate);
    return runMScript(
      () => ({
        $and: [
          {
            userId: this.session.userId,
            summaryDate: {
              $gte: new Date(start + "T00:00:00.000Z"),
              $lt: new Date(endExclusive + "T00:00:00.000Z"),
            },
          },
          { userId: this.session?.userId },
        ],
      }),
      { path: "services[3].businessLogic[13].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkParameter_referenceDate() {
    if (this.referenceDate == null) return;
    if (Array.isArray(this.referenceDate)) {
      throw new BadRequestError("errMsg_referenceDateMustNotBeAnArray");
    }
    if (new Date(this.referenceDate).getTime() !== new Date(this.referenceDate).getTime()) {
      throw new BadRequestError("errMsg_referenceDateTypeIsNotValid");
    }
  }

  checkParameters() {
    this.checkParameter_referenceDate();
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
    return await dbScriptGetMonthlyanalytics(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.nutritionDays, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
    if (_target) _target.monthlyAnalytics = this.monthlyAnalytics;
  }

  getSortBy() {
    return [["summaryDate", "ASC"]];
  }

  // Work Flow

  async afterMainListOperation() {
    try {
      this.monthlyAnalytics = await this.buildMonthlyAnalyticsData();
    } catch (err) {
      console.log("buildMonthlyAnalyticsData Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Computes 30-day averages, goal hit rates, and multi-macro trends
   ***********************************************************************/

  async buildMonthlyAnalyticsData() {
    try {
      return runMScript(
        () =>
          LIB.buildMonthlyAnalytics(this.session.userId, this.referenceDate),
        {
          path: "services[3].businessLogic[13].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction buildMonthlyAnalyticsData:",
        err,
      );
      throw err;
    }
  }
}

module.exports = GetMonthlyAnalyticsManager;

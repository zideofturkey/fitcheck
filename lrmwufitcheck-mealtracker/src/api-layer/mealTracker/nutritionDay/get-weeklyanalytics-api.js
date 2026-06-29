const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptGetWeeklyanalytics } = require("dbLayer");
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

class GetWeeklyAnalyticsManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getWeeklyAnalytics",
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
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({
        $and: [
          {
            userId: this.session.userId,
            summaryDate: { $gte: LIB.daysAgo(7) },
          },
          { userId: this.session?.userId },
        ],
      }),
      { path: "services[3].businessLogic[12].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkParameters() {
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
    return await dbScriptGetWeeklyanalytics(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.nutritionDays, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
    if (_target) _target.weeklyAnalytics = this.weeklyAnalytics;
  }

  getSortBy() {
    return [["summaryDate", "ASC"]];
  }

  // Work Flow

  async afterMainListOperation() {
    try {
      this.weeklyAnalytics = await this.buildWeeklyAnalyticsData();
    } catch (err) {
      console.log("buildWeeklyAnalyticsData Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Computes weekly averages, goal hit rates, and calorie trend
   ***********************************************************************/

  async buildWeeklyAnalyticsData() {
    try {
      return runMScript(() => LIB.buildWeeklyAnalytics(this.session.userId), {
        path: "services[3].businessLogic[12].actions.functionCallActions[0].callScript",
      });
    } catch (err) {
      console.error(
        "Error in FunctionCallAction buildWeeklyAnalyticsData:",
        err,
      );
      throw err;
    }
  }
}

module.exports = GetWeeklyAnalyticsManager;

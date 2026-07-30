const { runMScript } = require("common");

const PresetMealManager = require("./PresetMealManager");

const { dbScriptListPresetmeals } = require("dbLayer");
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

class ListPresetMealsManager extends PresetMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listPresetMeals",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetMeals";
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
    // Everyone, including admin/superAdmin, sees only their own records plus
    // anything marked isGlobal on this normal browsing endpoint - admin's
    // "see every user's private records" capability lives exclusively in
    // the dedicated admin-user-library route (src/routes/admin-user-library.js),
    // not here.
    return runMScript(
      () => ({
        $and: [
          { $or: [{ userId: this.session.userId }, { isGlobal: true }] },
          { isActive: true },
        ],
      }),
      { path: "services[2].businessLogic[9].whereClause.fullWhereClause" },
    );
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
    return await dbScriptListPresetmeals(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.presetMeals, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["id", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = ListPresetMealsManager;

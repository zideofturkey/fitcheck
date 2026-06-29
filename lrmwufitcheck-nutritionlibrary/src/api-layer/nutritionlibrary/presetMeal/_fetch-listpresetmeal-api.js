const { runMScript } = require("common");

const PresetMealManager = require("./PresetMealManager");

const { dbScript_fetchListpresetmeal } = require("dbLayer");
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
  convertUserQueryToElasticQuery,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class _fetchListPresetMealManager extends PresetMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListPresetMeal",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
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

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
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
    return runMScript(() => ({ isActive: true }), {
      path: "services[2].businessLogic[20].whereClause.fullWhereClause",
    });

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

  async fetchJoined_user(listpresetmeal) {
    // relation to user

    if (!listpresetmeal) {
      console.log(
        "listpresetmeal is null, so fetchJoined_listpresetmeal is ommitted",
      );
      return;
    }

    const foreignKey = listpresetmeal.map((item) => item.userId);

    const query = { id: { $in: foreignKey } };

    // For Elasticsearch
    const userIndex = new ElasticIndexer("user");
    const scriptQuery = convertUserQueryToElasticQuery(query);

    const dataList = (await userIndex.getDataByPage(0, 500, scriptQuery)) ?? [];

    const userList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["email"] = item["email"];
      newItem["password"] = item["password"];
      newItem["fullname"] = item["fullname"];
      newItem["avatar"] = item["avatar"];
      newItem["roleId"] = item["roleId"];
      newItem["emailVerified"] = item["emailVerified"];
      return newItem;
    });

    for (const item of userList) {
      const mainItems = listpresetmeal.filter(
        (mItem) => mItem.userId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.user = item;
      }
    }
  }

  async fetchJoinsToMainObject(listpresetmeal) {
    await this.fetchJoined_user(listpresetmeal);
  }

  async executeMainOperation() {
    return await dbScript_fetchListpresetmeal(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.presetMeals, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["createdAt", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = _fetchListPresetMealManager;

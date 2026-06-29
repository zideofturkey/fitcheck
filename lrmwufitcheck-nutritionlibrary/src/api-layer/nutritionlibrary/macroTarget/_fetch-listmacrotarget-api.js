const { runMScript } = require("common");

const MacroTargetManager = require("./MacroTargetManager");

const { dbScript_fetchListmacrotarget } = require("dbLayer");
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

class _fetchListMacroTargetManager extends MacroTargetManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListMacroTarget",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "macroTargets";
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
      path: "services[2].businessLogic[18].whereClause.fullWhereClause",
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

  async fetchJoined_user(listmacrotarget) {
    // relation to user

    if (!listmacrotarget) {
      console.log(
        "listmacrotarget is null, so fetchJoined_listmacrotarget is ommitted",
      );
      return;
    }

    const foreignKey = listmacrotarget.map((item) => item.userId);

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
      const mainItems = listmacrotarget.filter(
        (mItem) => mItem.userId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.user = item;
      }
    }
  }

  async fetchJoinsToMainObject(listmacrotarget) {
    await this.fetchJoined_user(listmacrotarget);
  }

  async executeMainOperation() {
    return await dbScript_fetchListmacrotarget(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.macroTargets, this.data  
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

module.exports = _fetchListMacroTargetManager;

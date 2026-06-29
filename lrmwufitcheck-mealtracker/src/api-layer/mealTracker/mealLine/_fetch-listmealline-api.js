const MealLineManager = require("./MealLineManager");

const {
  dbScript_fetchListmealline,
  getMealLogListByQuery,
} = require("dbLayer");
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
  convertUserQueryToSequelizeQuery,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class _fetchListMealLineManager extends MealLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListMealLine",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLogId = this.mealLogId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.mealLogId = request.query?.["mealLogId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.mealLogId = request.mcpParams?.["mealLogId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.mealLogId === null) {
      conditionalClauses.push({ mealLogId: { $isnull: true } });
    }
    if (this.mealLogId != null) {
      conditionalClauses.push({ mealLogId: this.mealLogId });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : !conditionalClauses.length
        ? null
        : conditionalClauses[0];

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkFilterParameter_mealLogId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.mealLogId;
    const paramOp = this.mealLogId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_mealLogIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_mealLogIdIsNotAValidID");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.mealLogId !== undefined) this.checkFilterParameter_mealLogId();
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

  async fetchJoined_mealLog(listmealline) {
    // relation to mealLog

    if (!listmealline) {
      console.log(
        "listmealline is null, so fetchJoined_listmealline is ommitted",
      );
      return;
    }

    const foreignKey = listmealline.map((item) => item.mealLogId);

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getMealLogListByQuery(scriptQuery)) ?? [];

    const mealLogList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["mealDate"] = item["mealDate"];
      newItem["mealTime"] = item["mealTime"];
      newItem["slotName"] = item["slotName"];
      newItem["logSource"] = item["logSource"];
      newItem["noteText"] = item["noteText"];
      newItem["totalCalories"] = item["totalCalories"];
      newItem["totalProtein"] = item["totalProtein"];
      newItem["totalCarbohydrates"] = item["totalCarbohydrates"];
      newItem["totalFat"] = item["totalFat"];
      newItem["totalSugar"] = item["totalSugar"];
      newItem["totalFiber"] = item["totalFiber"];
      return newItem;
    });

    for (const item of mealLogList) {
      const mainItems = listmealline.filter(
        (mItem) => mItem.mealLogId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.mealLog = item;
      }
    }
  }

  async fetchJoinsToMainObject(listmealline) {
    await this.fetchJoined_mealLog(listmealline);
  }

  async executeMainOperation() {
    return await dbScript_fetchListmealline(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.mealLines, this.data  
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

module.exports = _fetchListMealLineManager;

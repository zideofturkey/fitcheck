const { runMScript } = require("common");

const FoodItemManager = require("./FoodItemManager");

const { dbScript_fetchListfooditem } = require("dbLayer");
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

class _fetchListFoodItemManager extends FoodItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListFoodItem",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "foodItems";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.foodCategory = this.foodCategory;
    jsonObj.creationSource = this.creationSource;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.foodCategory = request.query?.["foodCategory"];
    this.creationSource = request.query?.["creationSource"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.foodCategory = request.mcpParams?.["foodCategory"];
    this.creationSource = request.mcpParams?.["creationSource"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(() => ({ isActive: true }), {
        path: "services[2].businessLogic[19].whereClause.fullWhereClause",
      }),
    );

    if (this.foodCategory === null) {
      conditionalClauses.push({ foodCategory: { $isnull: true } });
    }
    if (this.foodCategory != null && !Array.isArray(this.foodCategory)) {
      conditionalClauses.push({
        foodCategory: { $ilike: "%" + this.foodCategory + "%" },
      });
    }
    if (this.foodCategory != null && Array.isArray(this.foodCategory)) {
      conditionalClauses.push({
        $or: this.foodCategory.map((val) => ({
          foodCategory: { $ilike: "%" + val + "%" },
        })),
      });
    }
    if (this.creationSource === null) {
      conditionalClauses.push({ creationSource: { $isnull: true } });
    }
    if (this.creationSource != null) {
      conditionalClauses.push({ creationSource: this.creationSource });
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

  checkFilterParameter_foodCategory() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.foodCategory;
    const paramOp = this.foodCategory_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError(
            "errMsg_foodCategoryArrayHasAnInvalidString",
          );
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_foodCategoryIsNotAValidString");
      }
    }
  }

  checkFilterParameter_creationSource() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.creationSource;
    const paramOp = this.creationSource_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["manualentry", "aiassistant"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_creationSourceArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_creationSourceIsNotAValidEnumValue");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.foodCategory !== undefined)
      this.checkFilterParameter_foodCategory();

    if (this.creationSource !== undefined)
      this.checkFilterParameter_creationSource();
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

  async fetchJoined_user(listfooditem) {
    // relation to user

    if (!listfooditem) {
      console.log(
        "listfooditem is null, so fetchJoined_listfooditem is ommitted",
      );
      return;
    }

    const foreignKey = listfooditem.map((item) => item.userId);

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
      const mainItems = listfooditem.filter((mItem) => mItem.userId == item.id);

      for (const mainItem of mainItems) {
        mainItem.user = item;
      }
    }
  }

  async fetchJoinsToMainObject(listfooditem) {
    await this.fetchJoined_user(listfooditem);
  }

  async executeMainOperation() {
    return await dbScript_fetchListfooditem(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.foodItems, this.data  
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

module.exports = _fetchListFoodItemManager;

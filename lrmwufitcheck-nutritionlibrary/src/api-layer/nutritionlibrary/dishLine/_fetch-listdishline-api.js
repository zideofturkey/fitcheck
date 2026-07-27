const { runMScript } = require("common");

const DishLineManager = require("./DishLineManager");

const {
  dbScript_fetchListdishline,
  getDishListByQuery,
  getFoodItemListByQuery,
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

class _fetchListDishLineManager extends DishLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListDishLine",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dishLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.dishId = this.dishId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.dishId = request.query?.["dishId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.dishId = request.mcpParams?.["dishId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [{ isActive: true }];

    if (this.dishId === null) {
      conditionalClauses.push({ dishId: { $isnull: true } });
    }
    if (this.dishId != null) {
      conditionalClauses.push({ dishId: this.dishId });
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

  checkFilterParameter_dishId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.dishId;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_dishIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_dishIdIsNotAValidID");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.dishId !== undefined) this.checkFilterParameter_dishId();
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

  async fetchJoined_dish(listdishline) {
    // relation to dish

    if (!listdishline) {
      console.log(
        "listdishline is null, so fetchJoined_listdishline is ommitted",
      );
      return;
    }

    const foreignKey = listdishline.map((item) => item.dishId);

    const query = { id: { $in: foreignKey } };

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getDishListByQuery(scriptQuery)) ?? [];

    const dishList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["dishName"] = item["dishName"];
      newItem["descriptionText"] = item["descriptionText"];
      newItem["totalCalories"] = item["totalCalories"];
      newItem["totalProtein"] = item["totalProtein"];
      newItem["totalCarbohydrates"] = item["totalCarbohydrates"];
      newItem["totalFat"] = item["totalFat"];
      newItem["totalSugar"] = item["totalSugar"];
      newItem["totalFiber"] = item["totalFiber"];
      newItem["totalGramWeight"] = item["totalGramWeight"];
      return newItem;
    });

    for (const item of dishList) {
      const mainItems = listdishline.filter((mItem) => mItem.dishId == item.id);

      for (const mainItem of mainItems) {
        mainItem.dish = item;
      }
    }
  }

  async fetchJoined_foodItem(listdishline) {
    // relation to foodItem

    if (!listdishline) {
      console.log(
        "listdishline is null, so fetchJoined_listdishline is ommitted",
      );
      return;
    }

    const foreignKey = listdishline.map((item) => item.foodItemId);

    const query = { id: { $in: foreignKey } };

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getFoodItemListByQuery(scriptQuery)) ?? [];

    const foodItemList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["foodName"] = item["foodName"];
      newItem["caloriePer100g"] = item["caloriePer100g"];
      newItem["proteinPer100g"] = item["proteinPer100g"];
      newItem["carbohydratePer100g"] = item["carbohydratePer100g"];
      newItem["fatPer100g"] = item["fatPer100g"];
      newItem["sugarPer100g"] = item["sugarPer100g"];
      newItem["fiberPer100g"] = item["fiberPer100g"];
      newItem["brandName"] = item["brandName"];
      newItem["foodCategory"] = item["foodCategory"];
      newItem["creationSource"] = item["creationSource"];
      return newItem;
    });

    for (const item of foodItemList) {
      const mainItems = listdishline.filter(
        (mItem) => mItem.foodItemId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.foodItem = item;
      }
    }
  }

  async fetchJoinsToMainObject(listdishline) {
    await this.fetchJoined_dish(listdishline);
    await this.fetchJoined_foodItem(listdishline);
  }

  async executeMainOperation() {
    return await dbScript_fetchListdishline(this);

    /*
    the main operation result list is accessable in the context through
    this.dbResult.items, this.dishLines, this.data
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

module.exports = _fetchListDishLineManager;

const { runMScript } = require("common");

const PresetLineManager = require("./PresetLineManager");

const {
  dbScript_fetchListpresetline,
  getPresetMealListByQuery,
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

class _fetchListPresetLineManager extends PresetLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListPresetLine",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.presetMealId = this.presetMealId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.presetMealId = request.query?.["presetMealId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.presetMealId = request.mcpParams?.["presetMealId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(() => ({ isActive: true }), {
        path: "services[2].businessLogic[21].whereClause.fullWhereClause",
      }),
    );

    if (this.presetMealId === null) {
      conditionalClauses.push({ presetMealId: { $isnull: true } });
    }
    if (this.presetMealId != null) {
      conditionalClauses.push({ presetMealId: this.presetMealId });
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

  checkFilterParameter_presetMealId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.presetMealId;
    const paramOp = this.presetMealId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_presetMealIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_presetMealIdIsNotAValidID");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.presetMealId !== undefined)
      this.checkFilterParameter_presetMealId();
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

  async fetchJoined_presetMeal(listpresetline) {
    // relation to presetMeal

    if (!listpresetline) {
      console.log(
        "listpresetline is null, so fetchJoined_listpresetline is ommitted",
      );
      return;
    }

    const foreignKey = listpresetline.map((item) => item.presetMealId);

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getPresetMealListByQuery(scriptQuery)) ?? [];

    const presetMealList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["templateName"] = item["templateName"];
      newItem["descriptionText"] = item["descriptionText"];
      newItem["totalCalories"] = item["totalCalories"];
      newItem["totalProtein"] = item["totalProtein"];
      newItem["totalCarbohydrates"] = item["totalCarbohydrates"];
      newItem["totalFat"] = item["totalFat"];
      newItem["totalSugar"] = item["totalSugar"];
      newItem["totalFiber"] = item["totalFiber"];
      return newItem;
    });

    for (const item of presetMealList) {
      const mainItems = listpresetline.filter(
        (mItem) => mItem.presetMealId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.presetMeal = item;
      }
    }
  }

  async fetchJoined_foodItem(listpresetline) {
    // relation to foodItem

    if (!listpresetline) {
      console.log(
        "listpresetline is null, so fetchJoined_listpresetline is ommitted",
      );
      return;
    }

    const foreignKey = listpresetline.map((item) => item.foodItemId);

    const query = { id: { $in: foreignKey } };

    // Local database query

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
      const mainItems = listpresetline.filter(
        (mItem) => mItem.foodItemId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.foodItem = item;
      }
    }
  }

  async fetchJoinsToMainObject(listpresetline) {
    await this.fetchJoined_presetMeal(listpresetline);
    await this.fetchJoined_foodItem(listpresetline);
  }

  async executeMainOperation() {
    return await dbScript_fetchListpresetline(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.presetLines, this.data  
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

module.exports = _fetchListPresetLineManager;

const { runMScript } = require("common");

const DishLineManager = require("./DishLineManager");

const {
  dbScriptListDishlines,
  getDishByQuery,
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

class ListDishLinesManager extends DishLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listDishLines",
      controllerType: controllerType,
      pagination: false,
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
  }

  readRestParameters(request) {
    this.dishId = request.params?.["dishId"];
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
    return { $and: [{ dishId: this.dishId }, { isActive: true }] };

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkParameter_dishId() {
    if (this.dishId == null) {
      throw new BadRequestError("errMsg_dishIdisRequired");
    }

    if (Array.isArray(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    this.checkParameter_dishId();

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

  async fetchJoined_food(dishlines) {
    // relation to foodItem

    if (!dishlines) {
      console.log("dishlines is null, so fetchJoined_dishlines is ommitted");
      return;
    }

    const foreignKey = dishlines.map((item) => item.foodItemId);

    const query = { id: { $in: foreignKey } };

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getFoodItemListByQuery(scriptQuery)) ?? [];

    const foodList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["foodName"] = item["foodName"];
      newItem["caloriePer100g"] = item["caloriePer100g"];
      newItem["proteinPer100g"] = item["proteinPer100g"];
      newItem["carbohydratePer100g"] = item["carbohydratePer100g"];
      newItem["fatPer100g"] = item["fatPer100g"];
      newItem["sugarPer100g"] = item["sugarPer100g"];
      newItem["fiberPer100g"] = item["fiberPer100g"];
      return newItem;
    });

    for (const item of foodList) {
      const mainItems = dishlines.filter((mItem) => mItem.foodItemId == item.id);

      for (const mainItem of mainItems) {
        mainItem.food = item;
      }
    }
  }

  async fetchJoinsToMainObject(dishlines) {
    await this.fetchJoined_food(dishlines);
  }

  async executeMainOperation() {
    return await dbScriptListDishlines(this);

    /*
    the main operation result list is accessable in the context through
    this.dbResult.items, this.dishLines, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["id", "DESC"]];
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentDish = await this.fetchParentDishForList();
    } catch (err) {
      console.log("fetchParentDishForList Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validateDishOwnershipForList();
    } catch (err) {
      console.log("validateDishOwnershipForList Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Ensure the dish belongs to the authenticated user
   ***********************************************************************/

  async validateDishOwnershipForList() {
    if (this.checkAbsolute()) return true;

    if (!this.parentDish) {
      throw new ForbiddenError("Dish not found or access denied");
    }
    return true;
  }

  /***********************************************************************
   ** Fetch parent dish to validate ownership before listing lines
   ***********************************************************************/
  async fetchParentDishForList() {
    const userQuery = {
      $and: [
        { id: this.dishId, userId: this.session.userId, isActive: true },
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    const data = await getDishByQuery(scriptQuery);

    return data;
  }
}

module.exports = ListDishLinesManager;

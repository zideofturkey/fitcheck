const { runMScript } = require("common");

const DishManager = require("./DishManager");

const { dbScriptGetDish, getDishLineListByQuery } = require("dbLayer");
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

class GetDishManager extends DishManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getDish",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dish";
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

    this.dishId = this.dishId ?? this.id;
    this.id = this.dishId;
  }

  readMcpParameters(request) {
    this.dishId = request.mcpParams?.["dishId"];
    this.requestData = request.mcpParams;

    this.dishId = this.dishId ?? this.id;
    this.id = this.dishId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return { $and: [{ id: this.dishId }, { isActive: true }] };

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.dish) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    if (!this.checkAbsolute()) {
      if (this.dish?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_dishId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_dishId() {
    if (this.dishId == null) {
      throw new BadRequestError("errMsg_dishIdisRequired");
    }

    if (Array.isArray(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_dishId(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.dishId === "") this.dishId = null;
    this.checkParameter_dishId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.dish?.userId === this.session.userId;
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

  async fetchJoined_lines(dish) {
    // relation from dishLine

    if (!dish) {
      console.log("dish is null, so fetchJoined_dish is ommitted");
      return;
    }

    const foreignKey = dish.id;

    const query = { dishId: foreignKey };

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getDishLineListByQuery(scriptQuery)) ?? [];

    const linesList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["foodItemId"] = item["foodItemId"];
      newItem["lineFoodName"] = item["lineFoodName"];
      newItem["gramAmount"] = item["gramAmount"];
      newItem["lineCalories"] = item["lineCalories"];
      newItem["lineProtein"] = item["lineProtein"];
      newItem["lineCarbohydrates"] = item["lineCarbohydrates"];
      newItem["lineFat"] = item["lineFat"];
      newItem["lineSugar"] = item["lineSugar"];
      newItem["lineFiber"] = item["lineFiber"];
      newItem["dishId"] = item["dishId"];
      return newItem;
    });

    dish.lines = linesList;
  }

  async fetchJoinsToMainObject(dish) {
    await this.fetchJoined_lines(dish);
  }

  async executeMainOperation() {
    return await dbScriptGetDish(this);

    /*
    the main operation result is accessable in the context through
    this.dbResult, this.dish, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetDishManager;

const { runMScript } = require("common");

const FoodItemManager = require("./FoodItemManager");

const { dbScriptGetFooditemforlogging } = require("dbLayer");
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

class GetFoodItemForLoggingManager extends FoodItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getFoodItemForLogging",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "foodItem";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.foodItemId = this.foodItemId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.foodItemId = request.params?.["foodItemId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.foodItemId = this.foodItemId ?? this.id;
    this.id = this.foodItemId;
  }

  readMcpParameters(request) {
    this.foodItemId = request.mcpParams?.["foodItemId"];
    this.requestData = request.mcpParams;

    this.foodItemId = this.foodItemId ?? this.id;
    this.id = this.foodItemId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({
        $and: [
          { id: this.foodItemId, userId: this.session.userId, isActive: true },
          { isActive: true },
        ],
      }),
      { path: "services[2].businessLogic[16].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.foodItem) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_foodItemId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_foodItemId() {
    if (this.foodItemId == null) {
      throw new BadRequestError("errMsg_foodItemIdisRequired");
    }

    if (Array.isArray(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_foodItemId(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.foodItemId === "") this.foodItemId = null;
    this.checkParameter_foodItemId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.foodItem?.userId === this.session.userId;
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (
      this.userHasRole("admin") ||
      this.userHasRole("user") ||
      this.userHasRole("superAdmin")
    ) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptGetFooditemforlogging(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.foodItem, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetFoodItemForLoggingManager;

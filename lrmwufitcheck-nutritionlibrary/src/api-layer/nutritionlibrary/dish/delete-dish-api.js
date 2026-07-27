const { runMScript } = require("common");

const DishManager = require("./DishManager");

const { dbScriptDeleteDish, deleteDishLineByQuery } = require("dbLayer");
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

class DeleteDishManager extends DishManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteDish",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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

  async fetchInstance() {
    const { getDishByQuery } = require("dbLayer");

    this.dish = await getDishByQuery(this.whereClause);
    if (!this.dish) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.dish;
    this.instance = this.dish;
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

  async executeMainOperation() {
    return await dbScriptDeleteDish(this);

    /*
    the main operation result is accessable in the context through
    this.dbResult, this.dish, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      await this.deleteDishLines();
    } catch (err) {
      console.log("deleteDishLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Soft-delete all active dish lines belonging to this dish before
   ** deleting the parent
   ***********************************************************************/

  async deleteDishLines() {
    const userQuery = { dishId: this.dishId };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    return await deleteDishLineByQuery(query, this);
  }
}

module.exports = DeleteDishManager;

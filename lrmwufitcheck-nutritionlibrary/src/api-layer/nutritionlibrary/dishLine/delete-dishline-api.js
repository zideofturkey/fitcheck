const { runMScript } = require("common");

const DishLineManager = require("./DishLineManager");

const { dbScriptDeleteDishline, getDishByQuery } = require("dbLayer");
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

class DeleteDishLineManager extends DishLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteDishLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dishLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.dishLineId = this.dishLineId;
    jsonObj.dishId = this.dishId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.dishLineId = request.params?.["dishLineId"];
    this.dishId = request.params?.["dishId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.dishLineId = this.dishLineId ?? this.id;
    this.id = this.dishLineId;
  }

  readMcpParameters(request) {
    this.dishLineId = request.mcpParams?.["dishLineId"];
    this.dishId = request.mcpParams?.["dishId"];
    this.requestData = request.mcpParams;

    this.dishLineId = this.dishLineId ?? this.id;
    this.id = this.dishLineId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return {
      $and: [
        { id: this.dishLineId, dishId: this.dishId },
        { isActive: true },
      ],
    };

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async fetchInstance() {
    const { getDishLineByQuery } = require("dbLayer");

    this.dishLine = await getDishLineByQuery(this.whereClause);
    if (!this.dishLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.dishLine;
    this.instance = this.dishLine;
  }

  async checkInstance() {
    if (!this.dishLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_dishLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_dishLineId() {
    if (this.dishLineId == null) {
      throw new BadRequestError("errMsg_dishLineIdisRequired");
    }

    if (Array.isArray(this.dishLineId)) {
      throw new BadRequestError("errMsg_dishLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_dishLineId(this.dishLineId)) {
      throw new BadRequestError("errMsg_dishLineIdTypeIsNotValid");
    }
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
    if (this.dishLineId === "") this.dishLineId = null;
    this.checkParameter_dishLineId();

    this.checkParameter_dishId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.dishLine?._owner === this.session.userId;
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
    return await dbScriptDeleteDishline(this);

    /*
    the main operation result is accessable in the context through
    this.dbResult, this.dishLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentDish = await this.fetchParentDishForDelete();
    } catch (err) {
      console.log("fetchParentDishForDelete Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validateDishOwnershipForDelete();
    } catch (err) {
      console.log("validateDishOwnershipForDelete Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainDeleteOperation() {
    try {
      await this.recalcDishTotalsAfterDelete();
    } catch (err) {
      console.log("recalcDishTotalsAfterDelete Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Ensure the dish belongs to the authenticated user
   ***********************************************************************/

  async validateDishOwnershipForDelete() {
    if (this.checkAbsolute()) return true;

    if (!this.parentDish) {
      throw new ForbiddenError("Dish not found or access denied");
    }
    return true;
  }

  /***********************************************************************
   ** Fetch parent dish to validate ownership before deleting a line
   ***********************************************************************/
  async fetchParentDishForDelete() {
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

  /***********************************************************************
   ** Recalculate dish totals after line deletion
   ***********************************************************************/

  async recalcDishTotalsAfterDelete() {
    return await LIB.recalculateDishTotals(this.dishId);
  }
}

module.exports = DeleteDishLineManager;

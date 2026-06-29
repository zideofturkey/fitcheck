const { runMScript } = require("common");

const MealLogManager = require("./MealLogManager");

const { dbScriptGetMeallog } = require("dbLayer");
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

class GetMealLogManager extends MealLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getMealLog",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLog";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLogId = this.mealLogId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLogId = request.params?.["mealLogId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.mealLogId = this.mealLogId ?? this.id;
    this.id = this.mealLogId;
  }

  readMcpParameters(request) {
    this.mealLogId = request.mcpParams?.["mealLogId"];
    this.requestData = request.mcpParams;

    this.mealLogId = this.mealLogId ?? this.id;
    this.id = this.mealLogId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.mealLogId, userId: this.session.userId }),
      { path: "services[3].businessLogic[1].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.mealLog) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    if (!this.checkAbsolute()) {
      // Owner-field safety net: if the resolved owner field on the record is
      // null/undefined, the isOwner comparison could never succeed — either
      // the spec is missing a sessionSettings.isOwnerField property (so the
      // codegen wired the synthetic "_owner" column that does not exist), or
      // the record was written without the owner column. Throw a distinct,
      // attributable 403 instead of the misleading "wrong user" message that
      // sends operators chasing user-identity bugs that are really config bugs.
      if (this.mealLog?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_mealLogId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealLogId() {
    if (this.mealLogId == null) {
      throw new BadRequestError("errMsg_mealLogIdisRequired");
    }

    if (Array.isArray(this.mealLogId)) {
      throw new BadRequestError("errMsg_mealLogIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_mealLogId(this.mealLogId)) {
      throw new BadRequestError("errMsg_mealLogIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.mealLogId === "") this.mealLogId = null;
    this.checkParameter_mealLogId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.mealLog?.userId === this.session.userId;
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
    return await dbScriptGetMeallog(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.mealLog, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetMealLogManager;

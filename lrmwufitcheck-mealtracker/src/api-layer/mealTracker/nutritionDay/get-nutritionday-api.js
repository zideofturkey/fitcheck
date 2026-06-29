const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptGetNutritionday } = require("dbLayer");
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

class GetNutritionDayManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getNutritionDay",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "nutritionDay";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.nutritionDayId = this.nutritionDayId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.nutritionDayId = request.params?.["nutritionDayId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.nutritionDayId = this.nutritionDayId ?? this.id;
    this.id = this.nutritionDayId;
  }

  readMcpParameters(request) {
    this.nutritionDayId = request.mcpParams?.["nutritionDayId"];
    this.requestData = request.mcpParams;

    this.nutritionDayId = this.nutritionDayId ?? this.id;
    this.id = this.nutritionDayId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.nutritionDayId, userId: this.session.userId }),
      { path: "services[3].businessLogic[10].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.nutritionDay) {
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
      if (this.nutritionDay?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_nutritionDayId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_nutritionDayId() {
    if (this.nutritionDayId == null) {
      throw new BadRequestError("errMsg_nutritionDayIdisRequired");
    }

    if (Array.isArray(this.nutritionDayId)) {
      throw new BadRequestError("errMsg_nutritionDayIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_nutritionDayId(this.nutritionDayId)) {
      throw new BadRequestError("errMsg_nutritionDayIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.nutritionDayId === "") this.nutritionDayId = null;
    this.checkParameter_nutritionDayId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.nutritionDay?.userId === this.session.userId;
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
    return await dbScriptGetNutritionday(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.nutritionDay, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetNutritionDayManager;

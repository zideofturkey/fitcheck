const { runMScript } = require("common");

const AiCandidateMealManager = require("./AiCandidateMealManager");

const { dbScriptGetAicandidatemeal } = require("dbLayer");
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

class GetAiCandidateMealManager extends AiCandidateMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getAiCandidateMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateMeal";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiCandidateMealId = this.aiCandidateMealId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiCandidateMealId = request.params?.["aiCandidateMealId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiCandidateMealId = this.aiCandidateMealId ?? this.id;
    this.id = this.aiCandidateMealId;
  }

  readMcpParameters(request) {
    this.aiCandidateMealId = request.mcpParams?.["aiCandidateMealId"];
    this.requestData = request.mcpParams;

    this.aiCandidateMealId = this.aiCandidateMealId ?? this.id;
    this.id = this.aiCandidateMealId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.aiCandidateMealId, userId: this.session.userId }),
      { path: "services[4].businessLogic[5].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.aiCandidateMeal) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_aiCandidateMealId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiCandidateMealId() {
    if (this.aiCandidateMealId == null) {
      throw new BadRequestError("errMsg_aiCandidateMealIdisRequired");
    }

    if (Array.isArray(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiCandidateMealId(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.aiCandidateMealId === "") this.aiCandidateMealId = null;
    this.checkParameter_aiCandidateMealId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.aiCandidateMeal?.userId === this.session.userId;
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
    return await dbScriptGetAicandidatemeal(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiCandidateMeal, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetAiCandidateMealManager;

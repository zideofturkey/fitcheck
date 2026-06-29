const { runMScript } = require("common");

const AiSessionManager = require("./AiSessionManager");

const { dbScriptGetAisession } = require("dbLayer");
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

class GetAiSessionManager extends AiSessionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getAiSession",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiSession";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiSessionId = this.aiSessionId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiSessionId = request.params?.["aiSessionId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiSessionId = this.aiSessionId ?? this.id;
    this.id = this.aiSessionId;
  }

  readMcpParameters(request) {
    this.aiSessionId = request.mcpParams?.["aiSessionId"];
    this.requestData = request.mcpParams;

    this.aiSessionId = this.aiSessionId ?? this.id;
    this.id = this.aiSessionId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.aiSessionId, userId: this.session.userId }),
      { path: "services[4].businessLogic[3].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.aiSession) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_aiSessionId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiSessionId() {
    if (this.aiSessionId == null) {
      throw new BadRequestError("errMsg_aiSessionIdisRequired");
    }

    if (Array.isArray(this.aiSessionId)) {
      throw new BadRequestError("errMsg_aiSessionIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiSessionId(this.aiSessionId)) {
      throw new BadRequestError("errMsg_aiSessionIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.aiSessionId === "") this.aiSessionId = null;
    this.checkParameter_aiSessionId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.aiSession?.userId === this.session.userId;
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
    return await dbScriptGetAisession(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiSession, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetAiSessionManager;

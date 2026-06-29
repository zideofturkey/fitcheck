const { runMScript } = require("common");

const AiGuidanceNoteManager = require("./AiGuidanceNoteManager");

const { dbScriptGetAiguidancenote } = require("dbLayer");
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

class GetAiGuidanceNoteManager extends AiGuidanceNoteManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getAiGuidanceNote",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiGuidanceNote";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiGuidanceNoteId = this.aiGuidanceNoteId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiGuidanceNoteId = request.params?.["aiGuidanceNoteId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiGuidanceNoteId = this.aiGuidanceNoteId ?? this.id;
    this.id = this.aiGuidanceNoteId;
  }

  readMcpParameters(request) {
    this.aiGuidanceNoteId = request.mcpParams?.["aiGuidanceNoteId"];
    this.requestData = request.mcpParams;

    this.aiGuidanceNoteId = this.aiGuidanceNoteId ?? this.id;
    this.id = this.aiGuidanceNoteId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.aiGuidanceNoteId, userId: this.session.userId }),
      { path: "services[4].businessLogic[9].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.aiGuidanceNote) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_aiGuidanceNoteId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiGuidanceNoteId() {
    if (this.aiGuidanceNoteId == null) {
      throw new BadRequestError("errMsg_aiGuidanceNoteIdisRequired");
    }

    if (Array.isArray(this.aiGuidanceNoteId)) {
      throw new BadRequestError("errMsg_aiGuidanceNoteIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiGuidanceNoteId(this.aiGuidanceNoteId)) {
      throw new BadRequestError("errMsg_aiGuidanceNoteIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.aiGuidanceNoteId === "") this.aiGuidanceNoteId = null;
    this.checkParameter_aiGuidanceNoteId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.aiGuidanceNote?.userId === this.session.userId;
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
    return await dbScriptGetAiguidancenote(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiGuidanceNote, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetAiGuidanceNoteManager;

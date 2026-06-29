const { runMScript } = require("common");

const InviteLinkManager = require("./InviteLinkManager");

const { dbScriptGetInvitelink } = require("dbLayer");
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

class GetInviteLinkManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getInviteLink",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "inviteLink";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteLinkId = this.inviteLinkId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.inviteLinkId = request.params?.["inviteLinkId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  readMcpParameters(request) {
    this.inviteLinkId = request.mcpParams?.["inviteLinkId"];
    this.requestData = request.mcpParams;

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.inviteLinkId }), {
      path: "services[1].businessLogic[7].whereClause.fullWhereClause",
    });

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.inviteLink) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_inviteLinkId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_inviteLinkId() {
    if (this.inviteLinkId == null) {
      throw new BadRequestError("errMsg_inviteLinkIdisRequired");
    }

    if (Array.isArray(this.inviteLinkId)) {
      throw new BadRequestError("errMsg_inviteLinkIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_inviteLinkId(this.inviteLinkId)) {
      throw new BadRequestError("errMsg_inviteLinkIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.inviteLinkId === "") this.inviteLinkId = null;
    this.checkParameter_inviteLinkId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inviteLink?.ownerUserId === this.session.userId;
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("admin") || this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptGetInvitelink(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.inviteLink, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetInviteLinkManager;

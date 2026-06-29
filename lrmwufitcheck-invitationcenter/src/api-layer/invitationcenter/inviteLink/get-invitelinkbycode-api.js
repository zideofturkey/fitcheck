const { runMScript } = require("common");

const InviteLinkManager = require("./InviteLinkManager");

const { dbScriptGetInvitelinkbycode } = require("dbLayer");
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

class GetInviteLinkByCodeManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getInviteLinkByCode",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: false,
      M2MAllowed: false,
    });

    this.dataName = "inviteLink";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteCode = this.inviteCode;
  }

  readRestParameters(request) {
    this.inviteCode = request.params?.["inviteCode"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inviteCode = request.mcpParams?.["inviteCode"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ inviteCode: this.inviteCode }), {
      path: "services[1].businessLogic[6].whereClause.fullWhereClause",
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

  checkParameter_inviteCode() {
    if (this.inviteCode == null) {
      throw new BadRequestError("errMsg_inviteCodeisRequired");
    }

    if (Array.isArray(this.inviteCode)) {
      throw new BadRequestError("errMsg_inviteCodeMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    this.checkParameter_inviteCode();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inviteLink?.ownerUserId === this.session.userId;
  }

  async executeMainOperation() {
    return await dbScriptGetInvitelinkbycode(this);

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

module.exports = GetInviteLinkByCodeManager;

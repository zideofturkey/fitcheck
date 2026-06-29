const { runMScript } = require("common");

const Sys_agentConversationManager = require("./Sys_agentConversationManager");

const { dbScriptGetAgentchatmessages } = require("dbLayer");
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
const {
  AgentchatmessagesRetrivedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class GetAgentChatMessagesManager extends Sys_agentConversationManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getAgentChatMessages",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_agentConversation";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.sys_agentConversationId = this.sys_agentConversationId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.sys_agentConversationId = request.params?.["sys_agentConversationId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.sys_agentConversationId = this.sys_agentConversationId ?? this.id;
    this.id = this.sys_agentConversationId;
  }

  readMcpParameters(request) {
    this.sys_agentConversationId =
      request.mcpParams?.["sys_agentConversationId"];
    this.requestData = request.mcpParams;

    this.sys_agentConversationId = this.sys_agentConversationId ?? this.id;
    this.id = this.sys_agentConversationId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.sys_agentConversationId }), {
      path: "services[5].businessLogic[10].whereClause.fullWhereClause",
    });

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.sys_agentConversation) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_sys_agentConversationId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sys_agentConversationId() {
    if (this.sys_agentConversationId == null) {
      throw new BadRequestError("errMsg_sys_agentConversationIdisRequired");
    }

    if (Array.isArray(this.sys_agentConversationId)) {
      throw new BadRequestError(
        "errMsg_sys_agentConversationIdMustNotBeAnArray",
      );
    }

    // Parameter Type: ID

    if (
      !this.checkParameterType_sys_agentConversationId(
        this.sys_agentConversationId,
      )
    ) {
      throw new BadRequestError("errMsg_sys_agentConversationIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.sys_agentConversationId === "")
      this.sys_agentConversationId = null;
    this.checkParameter_sys_agentConversationId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.sys_agentConversation?._owner === this.session.userId;
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
    return await dbScriptGetAgentchatmessages(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.sys_agentConversation, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    AgentchatmessagesRetrivedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  // Action Store
}

module.exports = GetAgentChatMessagesManager;

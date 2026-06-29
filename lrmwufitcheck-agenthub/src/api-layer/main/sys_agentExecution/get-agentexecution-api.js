const { runMScript } = require("common");

const Sys_agentExecutionManager = require("./Sys_agentExecutionManager");

const { dbScriptGetAgentexecution } = require("dbLayer");
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
  AgentexecutionRetrivedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class GetAgentExecutionManager extends Sys_agentExecutionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getAgentExecution",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_agentExecution";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.sys_agentExecutionId = this.sys_agentExecutionId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.sys_agentExecutionId = request.params?.["sys_agentExecutionId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.sys_agentExecutionId = this.sys_agentExecutionId ?? this.id;
    this.id = this.sys_agentExecutionId;
  }

  readMcpParameters(request) {
    this.sys_agentExecutionId = request.mcpParams?.["sys_agentExecutionId"];
    this.requestData = request.mcpParams;

    this.sys_agentExecutionId = this.sys_agentExecutionId ?? this.id;
    this.id = this.sys_agentExecutionId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.sys_agentExecutionId }), {
      path: "services[5].businessLogic[8].whereClause.fullWhereClause",
    });

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.sys_agentExecution) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_sys_agentExecutionId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sys_agentExecutionId() {
    if (this.sys_agentExecutionId == null) {
      throw new BadRequestError("errMsg_sys_agentExecutionIdisRequired");
    }

    if (Array.isArray(this.sys_agentExecutionId)) {
      throw new BadRequestError("errMsg_sys_agentExecutionIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (
      !this.checkParameterType_sys_agentExecutionId(this.sys_agentExecutionId)
    ) {
      throw new BadRequestError("errMsg_sys_agentExecutionIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.sys_agentExecutionId === "") this.sys_agentExecutionId = null;
    this.checkParameter_sys_agentExecutionId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.sys_agentExecution?._owner === this.session.userId;
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
    return await dbScriptGetAgentexecution(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.sys_agentExecution, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    AgentexecutionRetrivedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  // Action Store
}

module.exports = GetAgentExecutionManager;

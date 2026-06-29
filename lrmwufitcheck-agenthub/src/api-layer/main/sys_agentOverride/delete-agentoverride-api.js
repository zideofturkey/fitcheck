const { runMScript } = require("common");

const Sys_agentOverrideManager = require("./Sys_agentOverrideManager");

const { dbScriptDeleteAgentoverride } = require("dbLayer");
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
  AgentoverrideDeletedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class DeleteAgentOverrideManager extends Sys_agentOverrideManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteAgentOverride",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_agentOverride";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.sys_agentOverrideId = this.sys_agentOverrideId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.sys_agentOverrideId = request.params?.["sys_agentOverrideId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.sys_agentOverrideId = this.sys_agentOverrideId ?? this.id;
    this.id = this.sys_agentOverrideId;
  }

  readMcpParameters(request) {
    this.sys_agentOverrideId = request.mcpParams?.["sys_agentOverrideId"];
    this.requestData = request.mcpParams;

    this.sys_agentOverrideId = this.sys_agentOverrideId ?? this.id;
    this.id = this.sys_agentOverrideId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.sys_agentOverrideId }), {
      path: "services[5].businessLogic[4].whereClause.fullWhereClause",
    });

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async fetchInstance() {
    const { getSys_agentOverrideByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.sys_agentOverride = await getSys_agentOverrideByQuery(
      this.whereClause,
    );
    if (!this.sys_agentOverride) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.sys_agentOverride;
    this.instance = this.sys_agentOverride;
  }

  async checkInstance() {
    if (!this.sys_agentOverride) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_sys_agentOverrideId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sys_agentOverrideId() {
    if (this.sys_agentOverrideId == null) {
      throw new BadRequestError("errMsg_sys_agentOverrideIdisRequired");
    }

    if (Array.isArray(this.sys_agentOverrideId)) {
      throw new BadRequestError("errMsg_sys_agentOverrideIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (
      !this.checkParameterType_sys_agentOverrideId(this.sys_agentOverrideId)
    ) {
      throw new BadRequestError("errMsg_sys_agentOverrideIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.sys_agentOverrideId === "") this.sys_agentOverrideId = null;
    this.checkParameter_sys_agentOverrideId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.sys_agentOverride?._owner === this.session.userId;
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
    return await dbScriptDeleteAgentoverride(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.sys_agentOverride, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    AgentoverrideDeletedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  // Action Store
}

module.exports = DeleteAgentOverrideManager;

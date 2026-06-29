const { runMScript } = require("common");

const Sys_toolCatalogManager = require("./Sys_toolCatalogManager");

const { dbScriptGetToolcatalogentry } = require("dbLayer");
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
  ToolcatalogentryRetrivedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class GetToolCatalogEntryManager extends Sys_toolCatalogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getToolCatalogEntry",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_toolCatalog";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.sys_toolCatalogId = this.sys_toolCatalogId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.sys_toolCatalogId = request.params?.["sys_toolCatalogId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.sys_toolCatalogId = this.sys_toolCatalogId ?? this.id;
    this.id = this.sys_toolCatalogId;
  }

  readMcpParameters(request) {
    this.sys_toolCatalogId = request.mcpParams?.["sys_toolCatalogId"];
    this.requestData = request.mcpParams;

    this.sys_toolCatalogId = this.sys_toolCatalogId ?? this.id;
    this.id = this.sys_toolCatalogId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.sys_toolCatalogId }), {
      path: "services[5].businessLogic[6].whereClause.fullWhereClause",
    });

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.sys_toolCatalog) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_sys_toolCatalogId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sys_toolCatalogId() {
    if (this.sys_toolCatalogId == null) {
      throw new BadRequestError("errMsg_sys_toolCatalogIdisRequired");
    }

    if (Array.isArray(this.sys_toolCatalogId)) {
      throw new BadRequestError("errMsg_sys_toolCatalogIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_sys_toolCatalogId(this.sys_toolCatalogId)) {
      throw new BadRequestError("errMsg_sys_toolCatalogIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.sys_toolCatalogId === "") this.sys_toolCatalogId = null;
    this.checkParameter_sys_toolCatalogId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.sys_toolCatalog?._owner === this.session.userId;
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
    return await dbScriptGetToolcatalogentry(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.sys_toolCatalog, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    ToolcatalogentryRetrivedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  // Action Store
}

module.exports = GetToolCatalogEntryManager;

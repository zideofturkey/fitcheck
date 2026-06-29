const { runMScript } = require("common");

const UserAvatarsFileManager = require("./UserAvatarsFileManager");

const { dbScriptGetUseravatarsfile } = require("dbLayer");
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
  UseravatarsfileRetrivedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class GetUserAvatarsFileManager extends UserAvatarsFileManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getUserAvatarsFile",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "userAvatarsFile";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userAvatarsFileId = this.userAvatarsFileId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.userAvatarsFileId = request.params?.["userAvatarsFileId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.userAvatarsFileId = this.userAvatarsFileId ?? this.id;
    this.id = this.userAvatarsFileId;
  }

  readMcpParameters(request) {
    this.userAvatarsFileId = request.mcpParams?.["userAvatarsFileId"];
    this.requestData = request.mcpParams;

    this.userAvatarsFileId = this.userAvatarsFileId ?? this.id;
    this.id = this.userAvatarsFileId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.userAvatarsFileId }), {
      path: "services[0].businessLogic[13].whereClause.fullWhereClause",
    });

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.userAvatarsFile) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_userAvatarsFileId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userAvatarsFileId() {
    if (this.userAvatarsFileId == null) {
      throw new BadRequestError("errMsg_userAvatarsFileIdisRequired");
    }

    if (Array.isArray(this.userAvatarsFileId)) {
      throw new BadRequestError("errMsg_userAvatarsFileIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_userAvatarsFileId(this.userAvatarsFileId)) {
      throw new BadRequestError("errMsg_userAvatarsFileIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.userAvatarsFileId === "") this.userAvatarsFileId = null;
    this.checkParameter_userAvatarsFileId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.userAvatarsFile?.ownerId === this.session.userId;
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
    return await dbScriptGetUseravatarsfile(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.userAvatarsFile, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UseravatarsfileRetrivedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  // Action Store
}

module.exports = GetUserAvatarsFileManager;

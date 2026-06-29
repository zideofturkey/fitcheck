const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptGetBriefuser } = require("dbLayer");
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
const { BriefuserRetrivedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class GetBriefUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getBriefUser",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: false,
      M2MAllowed: false,
    });

    this.dataName = "user";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
  }

  readRestParameters(request) {
    this.userId = request.params?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readGrpcParameters(request) {
    this.userId = request.inputData?.["userId"];
    this.requestData = request.inputData;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.requestData = request.mcpParams;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[11].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async checkInstance() {
    if (!this.user) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_userId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userId() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (Array.isArray(this.userId)) {
      throw new BadRequestError("errMsg_userIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_userId(this.userId)) {
      throw new BadRequestError("errMsg_userIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.user?.id === this.session.userId;
  }

  async executeMainOperation() {
    return await dbScriptGetBriefuser(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    BriefuserRetrivedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  getSelectList() {
    return ["id", "fullname", "avatar", "isActive"];
  }

  // Work Flow

  // Action Store
}

module.exports = GetBriefUserManager;

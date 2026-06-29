const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptStreamTest } = require("dbLayer");
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

class StreamTestManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "streamTest",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "user";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
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

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.requestData = request.mcpParams;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readSseParameters(request) {
    this.userId = request.params?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[12].whereClause.fullWhereClause" },
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
    return await dbScriptStreamTest(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSelectList() {
    return [
      "id",
      "email",
      "fullname",
      "avatar",
      "roleId",
      "emailVerified",
      "isActive",
      "createdAt",
      "updatedAt",
    ];
  }

  async createStreamSource(config) {
    return this.simulateStream();
  }

  // Work Flow

  // Action Store

  /***********************************************************************

  ***********************************************************************/
  async *simulateStream() {
    const source = await runMScript(
      () =>
        (async () =>
          (async function* () {
            const words =
              "Hello this is a simulated streaming response from the iterator action pattern".split(
                " ",
              );
            for (const w of words) {
              await new Promise((r) => setTimeout(r, 100));
              yield w + " ";
            }
          })())(),
      {
        path: "services[0].businessLogic[12].actions.iteratorActions[0].sourceScript",
      },
    );
    if (source && (source[Symbol.asyncIterator] || source[Symbol.iterator])) {
      yield* source;
    }
  }
}

module.exports = StreamTestManager;

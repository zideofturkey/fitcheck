const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptGetUser } = require("dbLayer");
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
const { UserRetrivedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class GetUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getUser",
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
      { path: "services[0].businessLogic[0].whereClause.fullWhereClause" },
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

    if (!this.checkAbsolute()) {
      // Owner-field safety net: if the resolved owner field on the record is
      // null/undefined, the isOwner comparison could never succeed — either
      // the spec is missing a sessionSettings.isOwnerField property (so the
      // codegen wired the synthetic "_owner" column that does not exist), or
      // the record was written without the owner column. Throw a distinct,
      // attributable 403 instead of the misleading "wrong user" message that
      // sends operators chasing user-identity bugs that are really config bugs.
      if (this.user?.id == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
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
    if (this.userHasRole("superAdmin") || this.userHasRole("admin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptGetUser(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UserRetrivedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
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

  // Work Flow

  async afterMainGetOperation() {
    try {
      await this.emitUserLoaded();
    } catch (err) {
      console.log("emitUserLoaded Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.emitProgress(
        "simulateEnrichment",
        "Starting simulateEnrichment",
      );
      await this.simulateEnrichment();
      await this.emitProgress(
        "simulateEnrichment",
        "simulateEnrichment completed",
      );
    } catch (err) {
      console.log("simulateEnrichment Action Error:", err.message);
      //**errorLog
      this.simulateEnrichmentError = err;
    }
  }

  // Action Store

  /***********************************************************************

  ***********************************************************************/

  async simulateEnrichment() {
    try {
      return await runMScript(
        () => (async () => await new Promise((r) => setTimeout(r, 50)))(),
        {
          path: "services[0].businessLogic[0].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error("Error in FunctionCallAction simulateEnrichment:", err);
      throw err;
    }
  }

  /***********************************************************************

  ***********************************************************************/

  async emitUserLoaded() {
    const eventData = runMScript(
      () => ({
        userId: this.user?.id,
        fullname: this.user?.fullname,
        email: this.user?.email,
      }),
      {
        path: "services[0].businessLogic[0].actions.emitSseEventActions[0].data",
      },
    );
    await this.emitProgress(
      "userLoaded",
      typeof eventData === "string" ? eventData : "",
      typeof eventData === "object" ? eventData : {},
    );
  }
}

module.exports = GetUserManager;

const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptUpdateProfile } = require("dbLayer");
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
  setRedisData,
} = require("common");
const { ProfileUpdatedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class UpdateProfileManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateProfile",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "user";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.fullname = this.fullname;
    jsonObj.avatar = this.avatar;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.fullname = request.body?.["fullname"];
    this.avatar = request.body?.["avatar"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.fullname = request.inputData?.["fullname"];
    this.avatar = request.inputData?.["avatar"];
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.fullname = request.mcpParams?.["fullname"];
    this.avatar = request.mcpParams?.["avatar"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.session.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[2].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  // data clause methods

  async buildDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      fullname: runMScript(() => this.fullname, {
        path: "services[0].businessLogic[2].dataClauseItems[0].value",
      }),
      avatar: runMScript(() => this.avatar, {
        path: "services[0].businessLogic[2].dataClauseItems[1].value",
      }),
    };

    // Resolve any Promise-valued fields. Designers should normally write
    // `await LIB.xx()` in MScript when the call is async, but if they
    // forget the `await`, runMScript returns the unresolved Promise and
    // it lands here. Awaiting Promise values keeps the row write safe;
    // sync values pass through untouched (no microtask cost).
    for (const _dcKey of Object.keys(dataClause)) {
      const _dcVal = dataClause[_dcKey];
      if (_dcVal && typeof _dcVal.then === "function") {
        dataClause[_dcKey] = await _dcVal;
      }
    }

    return dataClause;
  }

  async fetchInstance() {
    const { getUserByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.user = await getUserByQuery(this.whereClause);
    if (!this.user) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.user;
    this.instance = this.user;
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

  checkParameter_fullname() {
    if (this.fullname == null) return;

    if (Array.isArray(this.fullname)) {
      throw new BadRequestError("errMsg_fullnameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_avatar() {
    if (this.avatar == null) return;

    if (Array.isArray(this.avatar)) {
      throw new BadRequestError("errMsg_avatarMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    this.checkParameter_fullname();

    this.checkParameter_avatar();

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
    return await dbScriptUpdateProfile(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // GET /currentuser serves the Redis-cached session (not a fresh DB read),
  // so a profile edit that only writes the DB row leaves the cached session
  // — and every page reading `user` from it — stuck on the pre-edit values
  // until the next login. Patch the cache in place, keeping its existing TTL.
  async afterMainUpdateOperation() {
    if (!this.session?.sessionId) return;

    let changed = false;
    if (this.fullname != null) {
      this.session.fullname = this.fullname;
      changed = true;
    }
    if (this.avatar != null) {
      this.session.avatar = this.avatar;
      changed = true;
    }
    if (!changed) return;

    await setRedisData(
      "hexasession:" + this.session.sessionId,
      this.session,
      "KEEPTTL",
    );
  }

  async raiseEvent() {
    ProfileUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  // Action Store
}

module.exports = UpdateProfileManager;

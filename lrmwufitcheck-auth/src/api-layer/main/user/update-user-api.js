const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptUpdateUser } = require("dbLayer");
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
const { UserUpdatedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class UpdateUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateUser",
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
    jsonObj.userId = this.userId;
    jsonObj.fullname = this.fullname;
    jsonObj.avatar = this.avatar;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole =
      this.userHasRole("superAdmin") ||
      this.userHasRole("saasAdmin") ||
      this.userHasRole("admin") ||
      this.userHasRole("tenantOwner") ||
      this.userHasRole("tenantAdmin");
    if (!hasRole) {
      throw new ForbiddenError(
        "errMsg_UserRoleRequired:[superAdmin , saasAdmin , admin , tenantOwner , tenantAdmin]",
      );
    }
  }

  readRestParameters(request) {
    this.userId = request.params?.["userId"];
    this.fullname = request.body?.["fullname"];
    this.avatar = request.body?.["avatar"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readGrpcParameters(request) {
    this.userId = request.inputData?.["userId"];
    this.fullname = request.inputData?.["fullname"];
    this.avatar = request.inputData?.["avatar"];
    this.requestData = request.inputData;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.fullname = request.mcpParams?.["fullname"];
    this.avatar = request.mcpParams?.["avatar"];
    this.requestData = request.mcpParams;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[1].whereClause.fullWhereClause" },
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
        path: "services[0].businessLogic[1].dataClauseItems[0].value",
      }),
      avatar: runMScript(() => this.avatar, {
        path: "services[0].businessLogic[1].dataClauseItems[1].value",
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
    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

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
    return await dbScriptUpdateUser(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UserUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      this._r = await this.setRolesOrder();
    } catch (err) {
      console.log("setRolesOrder Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      if (
        runMScript(() => this.session.userId != this.userId, {
          path: "services[0].businessLogic[1].actions.validationActions[0].condition",
        })
      )
        await this.protectHigherRole();
    } catch (err) {
      console.log("protectHigherRole Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Prevents the update of a higher or equal user role if not themselves
   ***********************************************************************/

  async protectHigherRole() {
    let isValid;
    try {
      isValid = runMScript(
        () =>
          (this._r[this.session.roleId] ?? 0) >
          (this._r[this.user.roleId] ?? 0),
        {
          path: "services[0].businessLogic[1].actions.validationActions[0].validationScript",
        },
      );
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isValid && typeof isValid.then === "function") {
        isValid = await isValid;
      }
    } catch (err) {
      // Designer-emitted 4xx throws (BadRequestError, ForbiddenError,
      // NotFoundError, ConflictError, UnprocessableEntityError, …) propagate
      // verbatim — the MScript intentionally surfaced a typed business
      // validation failure and its message belongs in the response. Only
      // wrap genuinely unexpected exceptions (TypeError, ReferenceError,
      // null-deref, etc.) as 500 so operators can tell "rule rejected
      // input" from "the validation itself crashed".
      if (
        err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
      ) {
        throw err;
      }
      throw new HttpServerError(
        `Validation 'protectHigherRole' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new BadRequestError("AHigherUserRoleCantBeChanged");
    }
    return isValid;
  }

  /***********************************************************************
   ** Sets the hiyerarchy of the roles to check user permissions on other
   ** users
   ***********************************************************************/
  async setRolesOrder() {
    // Construct base object
    const obj = {};

    // Merge dynamic object
    Object.assign(
      obj,
      runMScript(
        () => ({
          superAdmin: 20,
          saasAdmin: 19,
          admin: 18,
          tenantOwner: 17,
          tenantAdmin: 16,
          saasUser: 15,
          tenantUser: 14,
          user: 13,
        }),
        {
          path: "services[0].businessLogic[1].actions.createObjectActions[0].mergeObject",
        },
      ),
    );

    return obj;
  }
}

module.exports = UpdateUserManager;

const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptUpdateUserpasswordbyadmin } = require("dbLayer");
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
  UserpasswordbyadminUpdatedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class UpdateUserPasswordByAdminManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateUserPasswordByAdmin",
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
    jsonObj.password = this.password;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.userId = request.params?.["userId"];
    this.password = request.body?.["password"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readGrpcParameters(request) {
    this.userId = request.inputData?.["userId"];
    this.password = request.inputData?.["password"];
    this.requestData = request.inputData;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.password = request.mcpParams?.["password"];
    this.requestData = request.mcpParams;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  async transformParameters() {
    try {
      this.password = runMScript(
        () => (this.password ? this.hashString(this.password) : null),
        {
          path: "services[0].businessLogic[10].requestParameters[0].transform",
        },
      );
    } catch (err) {
      hexaLogger.insertError(
        `Error transforming parameter password: ${err.message}`,
      );
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "password",
          script:
            "runMScript(() => (this.password ? this.hashString(this.password) : null), {'path':'services[0].businessLogic[10].requestParameters[0].transform'})",
          error: err.message,
        },
      );
    }
  }

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[10].whereClause.fullWhereClause" },
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
      password: runMScript(() => this.password, {
        path: "services[0].businessLogic[10].dataClauseItems[0].value",
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

  checkParameter_password() {
    if (this.password == null) {
      throw new BadRequestError("errMsg_passwordisRequired");
    }

    if (Array.isArray(this.password)) {
      throw new BadRequestError("errMsg_passwordMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    this.checkParameter_password();

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
    return await dbScriptUpdateUserpasswordbyadmin(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UserpasswordbyadminUpdatedPublisher.Publish(
      this.output,
      this.session,
    ).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  async afterCheckInstance() {
    try {
      this._r = await this.setRolesOrder();
    } catch (err) {
      console.log("setRolesOrder Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.protectHigherRole();
    } catch (err) {
      console.log("protectHigherRole Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Prevents the update of a higher or equal user role
   ***********************************************************************/

  async protectHigherRole() {
    let isValid;
    try {
      isValid = runMScript(
        () =>
          (this._r[this.session.roleId] ?? 0) >
          (this._r[this.user.roleId] ?? 0),
        {
          path: "services[0].businessLogic[10].actions.validationActions[0].validationScript",
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
      throw new BadRequestError("AHigherUserCantBeUpdated");
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
          path: "services[0].businessLogic[10].actions.createObjectActions[0].mergeObject",
        },
      ),
    );

    return obj;
  }
}

module.exports = UpdateUserPasswordByAdminManager;

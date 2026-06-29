const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptDeleteUser } = require("dbLayer");
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
const { UserDeletedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class DeleteUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteUser",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
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
      { path: "services[0].businessLogic[4].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
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
    return await dbScriptDeleteUser(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UserDeletedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  async afterCheckBasicAuth() {
    try {
      this._r = await this.setRolesOrder();
    } catch (err) {
      console.log("setRolesOrder Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.isSuperAdmin = await this.protectSuperAdmin();
    } catch (err) {
      console.log("protectSuperAdmin Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterCheckInstance() {
    try {
      await this.protectHigherRole();
    } catch (err) {
      console.log("protectHigherRole Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainDeleteOperation() {
    try {
      if (
        runMScript(() => this.auth != null, {
          path: "services[0].businessLogic[4].actions.functionCallActions[0].condition",
        })
      )
        await this.deleteUserSessions();
    } catch (err) {
      console.log("deleteUserSessions Action Error:", err.message);
      //**errorLog
      this.deleteUserSessionsError = err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Makes a call to this.auth to delete the sessions of the deleted user.
   ***********************************************************************/

  async deleteUserSessions() {
    try {
      return await runMScript(
        () =>
          (async () =>
            await (async (userId) => {
              await this.auth.deleteUserSessions(userId);
            })(this.userId))(),
        {
          path: "services[0].businessLogic[4].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error("Error in FunctionCallAction deleteUserSessions:", err);
      throw err;
    }
  }

  /***********************************************************************
   ** Prevents deletion of the SuperAdmin account. This safeguard ensures
   ** that the SuperAdmin userId cannot be removed under any circumstances.
   ***********************************************************************/

  async protectSuperAdmin() {
    let isError;
    try {
      isError = runMScript(() => this.userId == this.auth?.superAdminId, {
        path: "services[0].businessLogic[4].actions.validationActions[0].validationScript",
      });
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isError && typeof isError.then === "function") {
        isError = await isError;
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
        `Validation 'protectSuperAdmin' script failed: ${err.message}`,
        err,
      );
    }

    if (isError) {
      throw new BadRequestError("SuperAdminCantBeDeleted");
    }
    return isError;
  }

  /***********************************************************************
   ** Prevents the delete of a higher or equal user role
   ***********************************************************************/

  async protectHigherRole() {
    let isValid;
    try {
      isValid = runMScript(
        () =>
          (this._r[this.session?.roleId] ?? 0) >
          (this._r[this.user?.roleId] ?? 0),
        {
          path: "services[0].businessLogic[4].actions.validationActions[1].validationScript",
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
      throw new BadRequestError("AHigherOrEqualUserRoleCantBeDeleted");
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
          tenantUser: 0,
          user: 0,
        }),
        {
          path: "services[0].businessLogic[4].actions.createObjectActions[0].mergeObject",
        },
      ),
    );

    return obj;
  }
}

module.exports = DeleteUserManager;

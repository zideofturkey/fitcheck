const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptArchiveProfile } = require("dbLayer");
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
const { ProfileArchivedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ArchiveProfileManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "archiveProfile",
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
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.session.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[5].whereClause.fullWhereClause" },
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

  checkParameters() {
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
    return await dbScriptArchiveProfile(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    ProfileArchivedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  async afterCheckBasicAuth() {
    try {
      this.isSuperAdmin = await this.protectSuperAdmin();
    } catch (err) {
      console.log("protectSuperAdmin Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainDeleteOperation() {
    try {
      if (
        runMScript(() => this.auth != null, {
          path: "services[0].businessLogic[5].actions.functionCallActions[0].condition",
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
            })(this.session.userId))(),
        {
          path: "services[0].businessLogic[5].actions.functionCallActions[0].callScript",
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
      isError = runMScript(
        () => this.session.userId == this.auth?.superAdminId,
        {
          path: "services[0].businessLogic[5].actions.validationActions[0].validationScript",
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
}

module.exports = ArchiveProfileManager;

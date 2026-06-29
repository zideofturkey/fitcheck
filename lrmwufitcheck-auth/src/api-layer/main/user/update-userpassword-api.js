const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptUpdateUserpassword } = require("dbLayer");
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
const { UserpasswordUpdatedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class UpdateUserPasswordManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateUserPassword",
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
    jsonObj.oldPassword = this.oldPassword;
    jsonObj.newPassword = this.newPassword;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.oldPassword = request.body?.["oldPassword"];
    this.newPassword = request.body?.["newPassword"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.oldPassword = request.inputData?.["oldPassword"];
    this.newPassword = request.inputData?.["newPassword"];
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.oldPassword = request.mcpParams?.["oldPassword"];
    this.newPassword = request.mcpParams?.["newPassword"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {
    try {
      this.newPassword = runMScript(
        () => (this.newPassword ? this.hashString(this.newPassword) : null),
        { path: "services[0].businessLogic[9].requestParameters[1].transform" },
      );
    } catch (err) {
      hexaLogger.insertError(
        `Error transforming parameter newPassword: ${err.message}`,
      );
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "newPassword",
          script:
            "runMScript(() => (this.newPassword ? this.hashString(this.newPassword) : null), {'path':'services[0].businessLogic[9].requestParameters[1].transform'})",
          error: err.message,
        },
      );
    }
  }

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.session.userId }, { isActive: true }] }),
      { path: "services[0].businessLogic[9].whereClause.fullWhereClause" },
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
      password: runMScript(() => this.newPassword, {
        path: "services[0].businessLogic[9].dataClauseItems[0].value",
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

  checkParameter_oldPassword() {
    if (this.oldPassword == null) {
      throw new BadRequestError("errMsg_oldPasswordisRequired");
    }

    if (Array.isArray(this.oldPassword)) {
      throw new BadRequestError("errMsg_oldPasswordMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_newPassword() {
    if (this.newPassword == null) {
      throw new BadRequestError("errMsg_newPasswordisRequired");
    }

    if (Array.isArray(this.newPassword)) {
      throw new BadRequestError("errMsg_newPasswordMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    this.checkParameter_oldPassword();

    this.checkParameter_newPassword();

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
    return await dbScriptUpdateUserpassword(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UserpasswordUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  async afterCheckInstance() {
    try {
      this.isOldPasswordMatches = await this.checkOldPassword();
    } catch (err) {
      console.log("checkOldPassword Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Check if the current password mathces the old password. It is done
   ** after the instance is fetched.
   ***********************************************************************/

  async checkOldPassword() {
    if (this.checkAbsolute()) return true;

    let isValid;
    try {
      isValid = runMScript(
        () => this.hashCompare(this.oldPassword, this.user.password),
        {
          path: "services[0].businessLogic[9].actions.validationActions[0].validationScript",
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
        `Validation 'checkOldPassword' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new ForbiddenError("TheOldPasswordDoesNotMatch");
    }
    return isValid;
  }
}

module.exports = UpdateUserPasswordManager;

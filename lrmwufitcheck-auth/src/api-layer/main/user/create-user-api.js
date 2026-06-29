const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptCreateUser, getUserByQuery } = require("dbLayer");
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
const { UserCreatedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class CreateUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createUser",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "user";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.email = this.email;
    jsonObj.password = this.password;
    jsonObj.fullname = this.fullname;
    jsonObj.avatar = this.avatar;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole =
      this.userHasRole("superAdmin") ||
      this.userHasRole("admin") ||
      this.userHasRole("saasAdmin") ||
      this.userHasRole("tenantAdmin") ||
      this.userHasRole("tenantOwner");
    if (!hasRole) {
      throw new ForbiddenError(
        "errMsg_UserRoleRequired:[superAdmin , admin , saasAdmin , tenantAdmin , tenantOwner]",
      );
    }
  }

  readRestParameters(request) {
    this.userId = request.body?.["userId"];
    this.email = request.body?.["email"];
    this.password = request.body?.["password"];
    this.fullname = request.body?.["fullname"];
    this.avatar = request.body?.["avatar"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readGrpcParameters(request) {
    this.userId = request.inputData?.["userId"];
    this.email = request.inputData?.["email"];
    this.password = request.inputData?.["password"];
    this.fullname = request.inputData?.["fullname"];
    this.avatar = request.inputData?.["avatar"];
    this.id = request.inputData?.id;
    this.requestData = request.inputData;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.email = request.mcpParams?.["email"];
    this.password = request.mcpParams?.["password"];
    this.fullname = request.mcpParams?.["fullname"];
    this.avatar = request.mcpParams?.["avatar"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.userId = this.userId ?? this.id;
    this.id = this.userId;
  }

  async transformParameters() {
    try {
      this.avatar = runMScript(
        () =>
          this.avatar
            ? `https://gravatar.com/avatar/${LIB.common.md5(this.email ?? "nullValue")}?s=200&d=identicon`
            : null,
        { path: "services[0].businessLogic[3].requestParameters[3].transform" },
      );
    } catch (err) {
      hexaLogger.insertError(
        `Error transforming parameter avatar: ${err.message}`,
      );
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "avatar",
          script:
            "runMScript(() => (this.avatar ? `https://gravatar.com/avatar/${LIB.common.md5(this.email ?? 'nullValue')}?s=200&d=identicon` : null), {'path':'services[0].businessLogic[3].requestParameters[3].transform'})",
          error: err.message,
        },
      );
    }
  }

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.userId = this.id;
    if (!this.userId) this.userId = newUUID(false);
    this.id = this.userId;

    const dataClause = {
      id: this.userId,
      email: runMScript(() => this.email, {
        path: "services[0].businessLogic[3].dataClauseItems[0].value",
      }),
      password: runMScript(() => this.hashString(this.password), {
        path: "services[0].businessLogic[3].dataClauseItems[1].value",
      }),
      fullname: runMScript(() => this.fullname, {
        path: "services[0].businessLogic[3].dataClauseItems[2].value",
      }),
      avatar: runMScript(() => this.avatar, {
        path: "services[0].businessLogic[3].dataClauseItems[3].value",
      }),
      roleId: "user",
      emailVerified: false,
      isActive: true,
      _archivedAt: null,
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

  checkParameterType_userId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userId() {
    if (this.userId == null) return;

    if (Array.isArray(this.userId)) {
      throw new BadRequestError("errMsg_userIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_userId(this.userId)) {
      throw new BadRequestError("errMsg_userIdTypeIsNotValid");
    }
  }

  checkParameter_email() {
    if (this.email == null) {
      throw new BadRequestError("errMsg_emailisRequired");
    }

    if (Array.isArray(this.email)) {
      throw new BadRequestError("errMsg_emailMustNotBeAnArray");
    }

    // Parameter Type: String
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

  checkParameter_fullname() {
    if (this.fullname == null) {
      throw new BadRequestError("errMsg_fullnameisRequired");
    }

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

    this.checkParameter_email();

    this.checkParameter_password();

    this.checkParameter_fullname();

    this.checkParameter_avatar();

    // filter parameters
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
    return await dbScriptCreateUser(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.user, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UserCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      await this.validateEmail();
    } catch (err) {
      console.log("validateEmail Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      if (
        runMScript(() => this.userId == null, {
          path: "services[0].businessLogic[3].actions.fetchObjectActions[0].condition",
        })
      )
        this.archivedUser = await this.fetchArchivedUser();
    } catch (err) {
      console.log("fetchArchivedUser Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.checkArchivedUser();
    } catch (err) {
      console.log("checkArchivedUser Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterBuildOutput() {
    try {
      await this.writeVerificationNeedsToResponse();
    } catch (err) {
      console.log(
        "writeVerificationNeedsToResponse Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Check and get if any deleted user exists with the same identifier
   ***********************************************************************/
  async fetchArchivedUser() {
    // Fetch Object on childObject user

    const userQuery = runMScript(
      () => ({
        $and: [
          { email: this.email, isActive: false },
          {
            _archivedAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      }),
      {
        path: "services[0].businessLogic[3].actions.fetchObjectActions[0].whereClause",
      },
    );

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getUserByQuery(scriptQuery);

    return data
      ? {
          id: data["id"],
        }
      : null;
  }

  /***********************************************************************
   ** Validates that the provided email address has a valid format
   ***********************************************************************/

  async validateEmail() {
    let isValid;
    try {
      isValid = runMScript(
        () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email),
        {
          path: "services[0].businessLogic[3].actions.validationActions[0].validationScript",
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
        `Validation 'validateEmail' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new BadRequestError("InvalidEmailFormat");
    }
    return isValid;
  }

  /***********************************************************************
   ** Prevents re-register of a user when their profile is still in 30days
   ** archive
   ***********************************************************************/

  async checkArchivedUser() {
    let isError;
    try {
      isError = runMScript(() => this.archivedUser?.email != null, {
        path: "services[0].businessLogic[3].actions.validationActions[1].validationScript",
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
        `Validation 'checkArchivedUser' script failed: ${err.message}`,
        err,
      );
    }

    if (isError) {
      throw new BadRequestError("ThisProfileIsArchivedPleaseLoginToRestore");
    }
    return isError;
  }

  /***********************************************************************
   ** Set if email or mobile verification needed
   ***********************************************************************/
  async writeVerificationNeedsToResponse() {
    try {
      this.output["emailVerificationNeeded"] = runMScript(
        () => !this.user?.emailVerified,
        {
          path: "services[0].businessLogic[3].actions.addToResponseActions[0].context[0].contextValue",
        },
      );

      this.output["mobileVerificationNeeded"] = false;

      return true;
    } catch (error) {
      console.error("AddToResponseAction error:", error);
      throw error;
    }
  }
}

module.exports = CreateUserManager;

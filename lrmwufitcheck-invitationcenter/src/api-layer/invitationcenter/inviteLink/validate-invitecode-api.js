const { runMScript } = require("common");

const InviteLinkManager = require("./InviteLinkManager");

const { dbScriptValidateInvitecode, createInviteAudit } = require("dbLayer");
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
const { InvitecodeValidatedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ValidateInviteCodeManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "validateInviteCode",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: false,
      M2MAllowed: false,
    });

    this.dataName = "inviteLink";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteCode = this.inviteCode;
    jsonObj.ownerUserId = this.ownerUserId;
  }

  readRestParameters(request) {
    this.inviteCode = request.body?.["inviteCode"];
    this.ownerUserId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inviteCode = request.mcpParams?.["inviteCode"];
    this.ownerUserId = request.session?.["userId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ inviteCode: this.inviteCode, inviteState: "active" }),
      { path: "services[1].businessLogic[4].whereClause.fullWhereClause" },
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
      usageCount: runMScript(() => this.inviteLink.usageCount + 1, {
        path: "services[1].businessLogic[4].dataClauseItems[0].value",
      }),
      lastUsedAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[4].dataClauseItems[1].value",
      }),
      inviteState: runMScript(
        () => LIB.resolveInviteStateAfterUse(this.inviteLink),
        { path: "services[1].businessLogic[4].dataClauseItems[2].value" },
      ),
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

    // ID-typed dataClause fields strict-validation
    {
      const { isValidUUID } = require("common");
      const _idValidator = isValidUUID;
      const _idFieldsAndIsArray = [
        ["ownerUserId", false],
        ["registeredUserId", false],
      ];
      for (const [_idKey, _isArr] of _idFieldsAndIsArray) {
        const _idVal = dataClause[_idKey];
        if (_idVal == null) continue; // nullable / unset ID columns OK
        if (_isArr) {
          if (!Array.isArray(_idVal)) {
            throw new BadRequestError(`errMsg_${_idKey}MustBeAnArray`);
          }
          for (const _item of _idVal) {
            if (_item == null) continue;
            if (!_idValidator(_item)) {
              throw new BadRequestError(
                `errMsg_${_idKey}ArrayHasAnInvalidItem`,
              );
            }
          }
        } else {
          if (!_idValidator(_idVal)) {
            throw new BadRequestError(`errMsg_${_idKey}TypeIsNotValid`);
          }
        }
      }
    }

    return dataClause;
  }

  async fetchInstance() {
    const { getInviteLinkByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.inviteLink = await getInviteLinkByQuery(this.whereClause);
    if (!this.inviteLink) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.inviteLink;
    this.instance = this.inviteLink;
  }

  async checkInstance() {
    if (!this.inviteLink) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameter_inviteCode() {
    if (this.inviteCode == null) {
      throw new BadRequestError("errMsg_inviteCodeisRequired");
    }

    if (Array.isArray(this.inviteCode)) {
      throw new BadRequestError("errMsg_inviteCodeMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_ownerUserId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_ownerUserId() {
    if (this.ownerUserId == null) return;

    if (Array.isArray(this.ownerUserId)) {
      throw new BadRequestError("errMsg_ownerUserIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_ownerUserId(this.ownerUserId)) {
      throw new BadRequestError("errMsg_ownerUserIdTypeIsNotValid");
    }
  }

  checkParameters() {
    this.checkParameter_inviteCode();

    if (this.ownerUserId === "") this.ownerUserId = null;
    this.checkParameter_ownerUserId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inviteLink?.ownerUserId === this.session.userId;
  }

  async executeMainOperation() {
    return await dbScriptValidateInvitecode(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.inviteLink, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    InvitecodeValidatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      await this.checkNotExpired();
    } catch (err) {
      console.log("checkNotExpired Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.checkUsageLimit();
    } catch (err) {
      console.log("checkUsageLimit Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      await this.createAuditOnValidate();
    } catch (err) {
      console.log("createAuditOnValidate Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Insert an inviteAudit row recording the 'validated' lifecycle event
   ***********************************************************************/
  async createAuditOnValidate() {
    // Aggregated Update Operation on childObject inviteAudit

    const params = {
      inviteLinkId: runMScript(() => this.inviteLink.id, {
        path: "services[1].businessLogic[4].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      eventType: "validated",
      eventAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[4].actions.createCrudActions[0].dataClause[2].dataValue",
      }),
    };

    return await createInviteAudit(params, this);
  }

  /***********************************************************************
   ** Reject if the invite has an expiry date that has already passed
   ***********************************************************************/

  async checkNotExpired() {
    let isValid;
    try {
      isValid = runMScript(
        () =>
          !this.inviteLink.expiresAt ||
          new Date(this.inviteLink.expiresAt) >= new Date(LIB.now()),
        {
          path: "services[1].businessLogic[4].actions.validationActions[0].validationScript",
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
        `Validation 'checkNotExpired' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new BadRequestError("Invite link has expired");
    }
    return isValid;
  }

  /***********************************************************************
   ** Reject if the invite is limitedUse and has already hit its usage cap
   ***********************************************************************/

  async checkUsageLimit() {
    let isValid;
    try {
      isValid = runMScript(
        () =>
          !(
            this.inviteLink.usageMode === "limitedUse" &&
            this.inviteLink.usageCount >= this.inviteLink.usageLimit
          ),
        {
          path: "services[1].businessLogic[4].actions.validationActions[1].validationScript",
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
        `Validation 'checkUsageLimit' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new BadRequestError("Invite link usage limit reached");
    }
    return isValid;
  }
}

module.exports = ValidateInviteCodeManager;

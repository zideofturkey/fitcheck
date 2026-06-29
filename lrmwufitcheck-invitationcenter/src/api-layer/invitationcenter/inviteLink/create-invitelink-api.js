const { runMScript } = require("common");

const InviteLinkManager = require("./InviteLinkManager");

const { dbScriptCreateInvitelink, createInviteAudit } = require("dbLayer");
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

class CreateInviteLinkManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createInviteLink",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "inviteLink";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteLinkId = this.inviteLinkId;
    jsonObj.invitedEmail = this.invitedEmail;
    jsonObj.usageMode = this.usageMode;
    jsonObj.usageLimit = this.usageLimit;
    jsonObj.expiresAt = this.expiresAt;
    jsonObj.ownerUserId = this.ownerUserId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.inviteLinkId = request.body?.["inviteLinkId"];
    this.invitedEmail = request.body?.["invitedEmail"];
    this.usageMode = request.body?.["usageMode"];
    this.usageLimit = request.body?.["usageLimit"];
    this.expiresAt = request.body?.["expiresAt"];
    this.ownerUserId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  readMcpParameters(request) {
    this.inviteLinkId = request.mcpParams?.["inviteLinkId"];
    this.invitedEmail = request.mcpParams?.["invitedEmail"];
    this.usageMode = request.mcpParams?.["usageMode"];
    this.usageLimit = request.mcpParams?.["usageLimit"];
    this.expiresAt = request.mcpParams?.["expiresAt"];
    this.ownerUserId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.inviteLinkId = this.id;
    if (!this.inviteLinkId) this.inviteLinkId = newUUID(false);
    this.id = this.inviteLinkId;

    const dataClause = {
      id: this.inviteLinkId,
      ownerUserId: this.ownerUserId,
      inviteCode: runMScript(() => LIB.generateInviteCode(), {
        path: "services[1].businessLogic[0].dataClauseItems[0].value",
      }),
      invitedEmail: runMScript(() => this.invitedEmail, {
        path: "services[1].businessLogic[0].dataClauseItems[1].value",
      }),
      usageMode: runMScript(() => this.usageMode, {
        path: "services[1].businessLogic[0].dataClauseItems[2].value",
      }),
      usageLimit: runMScript(() => this.usageLimit || null, {
        path: "services[1].businessLogic[0].dataClauseItems[3].value",
      }),
      usageCount: 0,
      inviteState: "draft",
      expiresAt: runMScript(() => this.expiresAt || null, {
        path: "services[1].businessLogic[0].dataClauseItems[6].value",
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

  checkParameterType_inviteLinkId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_inviteLinkId() {
    if (this.inviteLinkId == null) return;

    if (Array.isArray(this.inviteLinkId)) {
      throw new BadRequestError("errMsg_inviteLinkIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_inviteLinkId(this.inviteLinkId)) {
      throw new BadRequestError("errMsg_inviteLinkIdTypeIsNotValid");
    }
  }

  checkParameter_invitedEmail() {
    if (this.invitedEmail == null) return;

    if (Array.isArray(this.invitedEmail)) {
      throw new BadRequestError("errMsg_invitedEmailMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_usageMode(paramValue) {
    function isInt(value) {
      return (
        !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10))
      );
    }

    const enumOptions = ["singleuse", "limiteduse"];
    if (typeof paramValue !== "string") {
      if (isInt(paramValue)) {
        paramValue = Number(paramValue);
        if (paramValue >= 0 && paramValue <= enumOptions.length - 1) {
          paramValue = enumOptions[paramValue];
          return paramValue;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    if (!enumOptions.includes(paramValue.toLowerCase())) {
      return false;
    }

    return true;
  }

  checkParameter_usageMode() {
    if (this.usageMode == null) {
      throw new BadRequestError("errMsg_usageModeisRequired");
    }

    if (Array.isArray(this.usageMode)) {
      throw new BadRequestError("errMsg_usageModeMustNotBeAnArray");
    }

    // Parameter Type: Enum

    const enumResult = this.checkParameterType_usageMode(this.usageMode);
    if (enumResult === false) {
      throw new BadRequestError("errMsg_usageModeTypeIsNotValid");
    } else if (enumResult !== true) {
      this.usageMode = enumResult;
    }
  }

  checkParameterType_usageLimit(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_usageLimit() {
    if (this.usageLimit == null) return;

    if (Array.isArray(this.usageLimit)) {
      throw new BadRequestError("errMsg_usageLimitMustNotBeAnArray");
    }

    // Parameter Type: Integer

    if (!this.checkParameterType_usageLimit(this.usageLimit)) {
      throw new BadRequestError("errMsg_usageLimitTypeIsNotValid");
    }
  }

  checkParameterType_expiresAt(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_expiresAt() {
    if (this.expiresAt == null) return;

    if (Array.isArray(this.expiresAt)) {
      throw new BadRequestError("errMsg_expiresAtMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_expiresAt(this.expiresAt)) {
      throw new BadRequestError("errMsg_expiresAtTypeIsNotValid");
    }
  }

  checkParameterType_ownerUserId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_ownerUserId() {
    if (this.ownerUserId == null) {
      throw new BadRequestError("errMsg_ownerUserIdisRequired");
    }

    if (Array.isArray(this.ownerUserId)) {
      throw new BadRequestError("errMsg_ownerUserIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_ownerUserId(this.ownerUserId)) {
      throw new BadRequestError("errMsg_ownerUserIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.inviteLinkId === "") this.inviteLinkId = null;
    this.checkParameter_inviteLinkId();

    this.checkParameter_invitedEmail();

    this.checkParameter_usageMode();

    this.checkParameter_usageLimit();

    this.checkParameter_expiresAt();

    if (this.ownerUserId === "") this.ownerUserId = null;
    this.checkParameter_ownerUserId();

    // filter parameters
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("admin") || this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptCreateInvitelink(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.inviteLink, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterMainCreateOperation() {
    try {
      await this.createAuditOnCreate();
    } catch (err) {
      console.log("createAuditOnCreate Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Insert an inviteAudit row recording the 'created' lifecycle event
   ***********************************************************************/
  async createAuditOnCreate() {
    // Aggregated Update Operation on childObject inviteAudit

    const params = {
      inviteLinkId: runMScript(() => this.inviteLink.id, {
        path: "services[1].businessLogic[0].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      eventType: "created",
      eventAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[0].actions.createCrudActions[0].dataClause[2].dataValue",
      }),
      actorUserId: runMScript(() => this.session.userId, {
        path: "services[1].businessLogic[0].actions.createCrudActions[0].dataClause[3].dataValue",
      }),
    };

    return await createInviteAudit(params, this);
  }
}

module.exports = CreateInviteLinkManager;

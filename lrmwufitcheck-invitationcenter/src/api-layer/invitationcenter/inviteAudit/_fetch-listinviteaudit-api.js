const InviteAuditManager = require("./InviteAuditManager");

const {
  dbScript_fetchListinviteaudit,
  getInviteLinkListByQuery,
} = require("dbLayer");
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
  convertUserQueryToSequelizeQuery,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class _fetchListInviteAuditManager extends InviteAuditManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListInviteAudit",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "inviteAudits";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteLinkId = this.inviteLinkId;
    jsonObj.eventType = this.eventType;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.inviteLinkId = request.query?.["inviteLinkId"];
    this.eventType = request.query?.["eventType"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inviteLinkId = request.mcpParams?.["inviteLinkId"];
    this.eventType = request.mcpParams?.["eventType"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.inviteLinkId === null) {
      conditionalClauses.push({ inviteLinkId: { $isnull: true } });
    }
    if (this.inviteLinkId != null) {
      conditionalClauses.push({ inviteLinkId: this.inviteLinkId });
    }
    if (this.eventType === null) {
      conditionalClauses.push({ eventType: { $isnull: true } });
    }
    if (this.eventType != null) {
      conditionalClauses.push({ eventType: this.eventType });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : !conditionalClauses.length
        ? null
        : conditionalClauses[0];

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkFilterParameter_inviteLinkId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.inviteLinkId;
    const paramOp = this.inviteLinkId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_inviteLinkIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_inviteLinkIdIsNotAValidID");
      }
    }
  }

  checkFilterParameter_eventType() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.eventType;
    const paramOp = this.eventType_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = [
      "created",
      "activated",
      "delivered",
      "validated",
      "consumed",
      "revoked",
      "expired",
    ];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_eventTypeArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_eventTypeIsNotAValidEnumValue");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.inviteLinkId !== undefined)
      this.checkFilterParameter_inviteLinkId();

    if (this.eventType !== undefined) this.checkFilterParameter_eventType();
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

  async fetchJoined_inviteLink(listinviteaudit) {
    // relation to inviteLink

    if (!listinviteaudit) {
      console.log(
        "listinviteaudit is null, so fetchJoined_listinviteaudit is ommitted",
      );
      return;
    }

    const foreignKey = listinviteaudit.map((item) => item.inviteLinkId);

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getInviteLinkListByQuery(scriptQuery)) ?? [];

    const inviteLinkList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["ownerUserId"] = item["ownerUserId"];
      newItem["inviteCode"] = item["inviteCode"];
      newItem["invitedEmail"] = item["invitedEmail"];
      newItem["usageMode"] = item["usageMode"];
      newItem["usageLimit"] = item["usageLimit"];
      newItem["usageCount"] = item["usageCount"];
      newItem["inviteState"] = item["inviteState"];
      newItem["expiresAt"] = item["expiresAt"];
      newItem["lastUsedAt"] = item["lastUsedAt"];
      newItem["registeredUserId"] = item["registeredUserId"];
      newItem["deliveryRequestedAt"] = item["deliveryRequestedAt"];
      newItem["lastDeliveredAt"] = item["lastDeliveredAt"];
      return newItem;
    });

    for (const item of inviteLinkList) {
      const mainItems = listinviteaudit.filter(
        (mItem) => mItem.inviteLinkId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.inviteLink = item;
      }
    }
  }

  async fetchJoinsToMainObject(listinviteaudit) {
    await this.fetchJoined_inviteLink(listinviteaudit);
  }

  async executeMainOperation() {
    return await dbScript_fetchListinviteaudit(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.inviteAudits, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["createdAt", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = _fetchListInviteAuditManager;

const InviteLinkManager = require("./InviteLinkManager");

const { dbScriptListInvitelinks } = require("dbLayer");
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

class ListInviteLinksManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listInviteLinks",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "inviteLinks";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.usageMode = this.usageMode;
    jsonObj.inviteState = this.inviteState;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.usageMode = request.query?.["usageMode"];
    this.inviteState = request.query?.["inviteState"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.usageMode = request.mcpParams?.["usageMode"];
    this.inviteState = request.mcpParams?.["inviteState"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.usageMode === null) {
      conditionalClauses.push({ usageMode: { $isnull: true } });
    }
    if (this.usageMode != null) {
      conditionalClauses.push({ usageMode: this.usageMode });
    }
    if (this.inviteState === null) {
      conditionalClauses.push({ inviteState: { $isnull: true } });
    }
    if (this.inviteState != null) {
      conditionalClauses.push({ inviteState: this.inviteState });
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

  checkFilterParameter_usageMode() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.usageMode;
    const paramOp = this.usageMode_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["singleuse", "limiteduse"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_usageModeArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_usageModeIsNotAValidEnumValue");
      }
    }
  }

  checkFilterParameter_inviteState() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.inviteState;
    const paramOp = this.inviteState_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = [
      "draft",
      "active",
      "exhausted",
      "revoked",
      "expired",
      "consumed",
    ];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_inviteStateArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_inviteStateIsNotAValidEnumValue");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.usageMode !== undefined) this.checkFilterParameter_usageMode();

    if (this.inviteState !== undefined) this.checkFilterParameter_inviteState();
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
    return await dbScriptListInvitelinks(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.inviteLinks, this.data  
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

module.exports = ListInviteLinksManager;

const { runMScript } = require("common");

const AiSessionManager = require("./AiSessionManager");

const { dbScriptListAisessions } = require("dbLayer");
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

class ListAiSessionsManager extends AiSessionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listAiSessions",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiSessions";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.sessionType = this.sessionType;
    jsonObj.sessionState = this.sessionState;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.userId = request.query?.["userId"];
    this.sessionType = request.query?.["sessionType"];
    this.sessionState = request.query?.["sessionState"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.sessionType = request.mcpParams?.["sessionType"];
    this.sessionState = request.mcpParams?.["sessionState"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(() => ({ userId: this.session.userId }), {
        path: "services[4].businessLogic[4].whereClause.fullWhereClause",
      }),
    );

    if (this.userId === null) {
      conditionalClauses.push({ userId: { $isnull: true } });
    }
    if (this.userId != null) {
      conditionalClauses.push({ userId: this.userId });
    }
    if (this.sessionType === null) {
      conditionalClauses.push({ sessionType: { $isnull: true } });
    }
    if (this.sessionType != null) {
      conditionalClauses.push({ sessionType: this.sessionType });
    }
    if (this.sessionState === null) {
      conditionalClauses.push({ sessionState: { $isnull: true } });
    }
    if (this.sessionState != null) {
      conditionalClauses.push({ sessionState: this.sessionState });
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

  checkFilterParameter_userId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.userId;
    const paramOp = this.userId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_userIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_userIdIsNotAValidID");
      }
    }
  }

  checkFilterParameter_sessionType() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.sessionType;
    const paramOp = this.sessionType_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["mealparsing", "nutritionguidance"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_sessionTypeArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_sessionTypeIsNotAValidEnumValue");
      }
    }
  }

  checkFilterParameter_sessionState() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.sessionState;
    const paramOp = this.sessionState_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["pending", "needsconfirmation", "completed", "failed"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_sessionStateArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_sessionStateIsNotAValidEnumValue");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.userId !== undefined) this.checkFilterParameter_userId();

    if (this.sessionType !== undefined) this.checkFilterParameter_sessionType();

    if (this.sessionState !== undefined)
      this.checkFilterParameter_sessionState();
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
    return await dbScriptListAisessions(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.aiSessions, this.data  
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

module.exports = ListAiSessionsManager;

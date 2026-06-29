const { runMScript } = require("common");

const AiGuidanceNoteManager = require("./AiGuidanceNoteManager");

const { dbScriptListAiguidancenotes } = require("dbLayer");
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

class ListAiGuidanceNotesManager extends AiGuidanceNoteManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listAiGuidanceNotes",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiGuidanceNotes";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.questionType = this.questionType;
    jsonObj.contextRange = this.contextRange;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.userId = request.query?.["userId"];
    this.questionType = request.query?.["questionType"];
    this.contextRange = request.query?.["contextRange"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.questionType = request.mcpParams?.["questionType"];
    this.contextRange = request.mcpParams?.["contextRange"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(() => ({ userId: this.session.userId }), {
        path: "services[4].businessLogic[10].whereClause.fullWhereClause",
      }),
    );

    if (this.userId === null) {
      conditionalClauses.push({ userId: { $isnull: true } });
    }
    if (this.userId != null) {
      conditionalClauses.push({ userId: this.userId });
    }
    if (this.questionType === null) {
      conditionalClauses.push({ questionType: { $isnull: true } });
    }
    if (this.questionType != null && !Array.isArray(this.questionType)) {
      conditionalClauses.push({
        questionType: { $ilike: "%" + this.questionType + "%" },
      });
    }
    if (this.questionType != null && Array.isArray(this.questionType)) {
      conditionalClauses.push({
        $or: this.questionType.map((val) => ({
          questionType: { $ilike: "%" + val + "%" },
        })),
      });
    }
    if (this.contextRange === null) {
      conditionalClauses.push({ contextRange: { $isnull: true } });
    }
    if (this.contextRange != null && !Array.isArray(this.contextRange)) {
      conditionalClauses.push({
        contextRange: { $ilike: "%" + this.contextRange + "%" },
      });
    }
    if (this.contextRange != null && Array.isArray(this.contextRange)) {
      conditionalClauses.push({
        $or: this.contextRange.map((val) => ({
          contextRange: { $ilike: "%" + val + "%" },
        })),
      });
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

  checkFilterParameter_questionType() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.questionType;
    const paramOp = this.questionType_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError(
            "errMsg_questionTypeArrayHasAnInvalidString",
          );
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_questionTypeIsNotAValidString");
      }
    }
  }

  checkFilterParameter_contextRange() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.contextRange;
    const paramOp = this.contextRange_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError(
            "errMsg_contextRangeArrayHasAnInvalidString",
          );
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_contextRangeIsNotAValidString");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.userId !== undefined) this.checkFilterParameter_userId();

    if (this.questionType !== undefined)
      this.checkFilterParameter_questionType();

    if (this.contextRange !== undefined)
      this.checkFilterParameter_contextRange();
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
    return await dbScriptListAiguidancenotes(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.aiGuidanceNotes, this.data  
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

module.exports = ListAiGuidanceNotesManager;

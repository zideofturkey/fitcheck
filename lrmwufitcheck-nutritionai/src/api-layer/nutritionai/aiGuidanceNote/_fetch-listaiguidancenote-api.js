const AiGuidanceNoteManager = require("./AiGuidanceNoteManager");

const {
  dbScript_fetchListaiguidancenote,
  getAiSessionListByQuery,
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

class _fetchListAiGuidanceNoteManager extends AiGuidanceNoteManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListAiGuidanceNote",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
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

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
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

  async fetchJoined_session_(listaiguidancenote) {
    // relation to aiSession

    if (!listaiguidancenote) {
      console.log(
        "listaiguidancenote is null, so fetchJoined_listaiguidancenote is ommitted",
      );
      return;
    }

    const foreignKey = listaiguidancenote.map((item) => item.aiSessionId);

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getAiSessionListByQuery(scriptQuery)) ?? [];

    const session_List = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["sessionType"] = item["sessionType"];
      newItem["inputText"] = item["inputText"];
      newItem["detectedLanguage"] = item["detectedLanguage"];
      newItem["sessionState"] = item["sessionState"];
      newItem["confidenceScore"] = item["confidenceScore"];
      newItem["finalResponseText"] = item["finalResponseText"];
      return newItem;
    });

    for (const item of session_List) {
      const mainItems = listaiguidancenote.filter(
        (mItem) => mItem.aiSessionId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.session_ = item;
      }
    }
  }

  async fetchJoinsToMainObject(listaiguidancenote) {
    await this.fetchJoined_session_(listaiguidancenote);
  }

  async executeMainOperation() {
    return await dbScript_fetchListaiguidancenote(this);

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

module.exports = _fetchListAiGuidanceNoteManager;

const Sys_agentExecutionManager = require("./Sys_agentExecutionManager");

const { dbScriptListAgentexecutions } = require("dbLayer");
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
const {
  AgentexecutionsListedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ListAgentExecutionsManager extends Sys_agentExecutionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listAgentExecutions",
      controllerType: controllerType,
      pagination: false,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_agentExecutions";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.agentName = this.agentName;
    jsonObj.agentType = this.agentType;
    jsonObj.source = this.source;
    jsonObj.userId = this.userId;
    jsonObj.status = this.status;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.agentName = request.query?.["agentName"];
    this.agentType = request.query?.["agentType"];
    this.source = request.query?.["source"];
    this.userId = request.query?.["userId"];
    this.status = request.query?.["status"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.agentName = request.mcpParams?.["agentName"];
    this.agentType = request.mcpParams?.["agentType"];
    this.source = request.mcpParams?.["source"];
    this.userId = request.mcpParams?.["userId"];
    this.status = request.mcpParams?.["status"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.agentName === null) {
      conditionalClauses.push({ agentName: { $isnull: true } });
    }
    if (this.agentName != null && !Array.isArray(this.agentName)) {
      conditionalClauses.push({
        agentName: { $ilike: "%" + this.agentName + "%" },
      });
    }
    if (this.agentName != null && Array.isArray(this.agentName)) {
      conditionalClauses.push({
        $or: this.agentName.map((val) => ({
          agentName: { $ilike: "%" + val + "%" },
        })),
      });
    }
    if (this.agentType === null) {
      conditionalClauses.push({ agentType: { $isnull: true } });
    }
    if (this.agentType != null) {
      conditionalClauses.push({ agentType: this.agentType });
    }
    if (this.source === null) {
      conditionalClauses.push({ source: { $isnull: true } });
    }
    if (this.source != null) {
      conditionalClauses.push({ source: this.source });
    }
    if (this.userId === null) {
      conditionalClauses.push({ userId: { $isnull: true } });
    }
    if (this.userId != null) {
      conditionalClauses.push({ userId: this.userId });
    }
    if (this.status === null) {
      conditionalClauses.push({ status: { $isnull: true } });
    }
    if (this.status != null) {
      conditionalClauses.push({ status: this.status });
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

  checkFilterParameter_agentName() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.agentName;
    const paramOp = this.agentName_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError("errMsg_agentNameArrayHasAnInvalidString");
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_agentNameIsNotAValidString");
      }
    }
  }

  checkFilterParameter_agentType() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.agentType;
    const paramOp = this.agentType_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["design", "dynamic"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_agentTypeArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_agentTypeIsNotAValidEnumValue");
      }
    }
  }

  checkFilterParameter_source() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.source;
    const paramOp = this.source_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["rest", "sse", "kafka", "agent"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError("errMsg_sourceArrayHasAnInvalidEnumValue");
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_sourceIsNotAValidEnumValue");
      }
    }
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

  checkFilterParameter_status() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.status;
    const paramOp = this.status_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["success", "error", "timeout"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError("errMsg_statusArrayHasAnInvalidEnumValue");
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_statusIsNotAValidEnumValue");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.agentName !== undefined) this.checkFilterParameter_agentName();

    if (this.agentType !== undefined) this.checkFilterParameter_agentType();

    if (this.source !== undefined) this.checkFilterParameter_source();

    if (this.userId !== undefined) this.checkFilterParameter_userId();

    if (this.status !== undefined) this.checkFilterParameter_status();
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
    return await dbScriptListAgentexecutions(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.sys_agentExecutions, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    AgentexecutionsListedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  getSortBy() {
    return [["id", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = ListAgentExecutionsManager;

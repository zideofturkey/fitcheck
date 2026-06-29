const Sys_toolCatalogManager = require("./Sys_toolCatalogManager");

const { dbScriptListToolcatalog } = require("dbLayer");
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
const { ToolcatalogListedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ListToolCatalogManager extends Sys_toolCatalogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listToolCatalog",
      controllerType: controllerType,
      pagination: false,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_toolCatalogs";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.serviceName = this.serviceName;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.serviceName = request.query?.["serviceName"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.serviceName = request.mcpParams?.["serviceName"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.serviceName === null) {
      conditionalClauses.push({ serviceName: { $isnull: true } });
    }
    if (this.serviceName != null && !Array.isArray(this.serviceName)) {
      conditionalClauses.push({
        serviceName: { $ilike: "%" + this.serviceName + "%" },
      });
    }
    if (this.serviceName != null && Array.isArray(this.serviceName)) {
      conditionalClauses.push({
        $or: this.serviceName.map((val) => ({
          serviceName: { $ilike: "%" + val + "%" },
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

  checkFilterParameter_serviceName() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.serviceName;
    const paramOp = this.serviceName_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError(
            "errMsg_serviceNameArrayHasAnInvalidString",
          );
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_serviceNameIsNotAValidString");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.serviceName !== undefined) this.checkFilterParameter_serviceName();
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
    return await dbScriptListToolcatalog(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.sys_toolCatalogs, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    ToolcatalogListedPublisher.Publish(this.output, this.session).catch(
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

module.exports = ListToolCatalogManager;

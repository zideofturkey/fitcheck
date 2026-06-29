const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptSearchUsers } = require("dbLayer");
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
const { UsersSearchedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class SearchUsersManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "searchUsers",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "users";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.keyword = this.keyword;
    jsonObj.roleId = this.roleId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.keyword = request.query?.["keyword"];
    this.roleId = request.query?.["roleId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.keyword = request.inputData?.["keyword"];
    this.roleId = request.inputData?.["roleId"];
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.keyword = request.mcpParams?.["keyword"];
    this.roleId = request.mcpParams?.["roleId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  // Code for Search Filter
  async getSearchFilterIdArray() {
    // Search objects from user Elastic Search Index

    if (
      !runMScript(() => this.keyword, {
        path: "services[0].businessLogic[7].listOptions.searchFilter.keyword",
      })
    )
      return null;

    const scriptQuery = {
      multi_match: {
        query: runMScript(() => this.keyword, {
          path: "services[0].businessLogic[7].listOptions.searchFilter.keyword",
        }),
        fields: ["email.ftext", "fullname.ftext"],
        fuzziness: "AUTO",
      },
    };

    const elasticIndex = new ElasticIndexer("user");
    const searchResult = await elasticIndex.getDataByPage(0, 500, scriptQuery);
    if (!searchResult) return [];
    return searchResult.map((item) => item.id);
  }

  async getRouteQuery() {
    const searchFilterIdArray = runMScript(() => this.keyword != null, {
      path: "services[0].businessLogic[7].listOptions.searchFilter.condition",
    })
      ? await this.getSearchFilterIdArray()
      : [];

    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(() => ({ isActive: true }), {
        path: "services[0].businessLogic[7].whereClause.fullWhereClause",
      }),
    );

    if (this.roleId === null) {
      conditionalClauses.push({ roleId: { $isnull: true } });
    }
    if (this.roleId != null && !Array.isArray(this.roleId)) {
      conditionalClauses.push({ roleId: { $ilike: "%" + this.roleId + "%" } });
    }
    if (this.roleId != null && Array.isArray(this.roleId)) {
      conditionalClauses.push({
        $or: this.roleId.map((val) => ({
          roleId: { $ilike: "%" + val + "%" },
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

  checkParameter_keyword() {
    if (this.keyword == null) {
      throw new BadRequestError("errMsg_keywordisRequired");
    }

    if (Array.isArray(this.keyword)) {
      throw new BadRequestError("errMsg_keywordMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkFilterParameter_roleId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.roleId;
    const paramOp = this.roleId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError("errMsg_roleIdArrayHasAnInvalidString");
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_roleIdIsNotAValidString");
      }
    }
  }

  checkParameters() {
    this.checkParameter_keyword();

    // filter parameters

    if (this.roleId !== undefined) this.checkFilterParameter_roleId();
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("superAdmin") || this.userHasRole("admin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptSearchUsers(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.users, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UsersSearchedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
      //**errorLog
    });
  }

  getSelectList() {
    return [
      "id",
      "email",
      "fullname",
      "avatar",
      "roleId",
      "emailVerified",
      "isActive",
      "createdAt",
      "updatedAt",
    ];
  }

  getSortBy() {
    return [["id", "ASC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = SearchUsersManager;

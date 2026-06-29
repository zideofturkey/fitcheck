const { runMScript } = require("common");

const UserManager = require("./UserManager");

const { dbScriptListUsers } = require("dbLayer");
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
const { UsersListedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ListUsersManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listUsers",
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
    jsonObj.email = this.email;
    jsonObj.fullname = this.fullname;
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
    this.email = request.query?.["email"];
    this.fullname = request.query?.["fullname"];
    this.roleId = request.query?.["roleId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.email = request.inputData?.["email"];
    this.fullname = request.inputData?.["fullname"];
    this.roleId = request.inputData?.["roleId"];
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.email = request.mcpParams?.["email"];
    this.fullname = request.mcpParams?.["fullname"];
    this.roleId = request.mcpParams?.["roleId"];
    this.requestData = request.mcpParams;
  }

  readSseParameters(request) {
    this.email = request.query?.["email"];
    this.fullname = request.query?.["fullname"];
    this.roleId = request.query?.["roleId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(() => ({ isActive: true }), {
        path: "services[0].businessLogic[6].whereClause.fullWhereClause",
      }),
    );

    if (this.email === null) {
      conditionalClauses.push({ email: { $isnull: true } });
    }
    if (this.email != null && !Array.isArray(this.email)) {
      conditionalClauses.push({ email: { $ilike: "%" + this.email + "%" } });
    }
    if (this.email != null && Array.isArray(this.email)) {
      conditionalClauses.push({
        $or: this.email.map((val) => ({ email: { $ilike: "%" + val + "%" } })),
      });
    }
    if (this.fullname === null) {
      conditionalClauses.push({ fullname: { $isnull: true } });
    }
    if (this.fullname != null && !Array.isArray(this.fullname)) {
      conditionalClauses.push({
        fullname: { $ilike: "%" + this.fullname + "%" },
      });
    }
    if (this.fullname != null && Array.isArray(this.fullname)) {
      conditionalClauses.push({
        $or: this.fullname.map((val) => ({
          fullname: { $ilike: "%" + val + "%" },
        })),
      });
    }
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

  checkFilterParameter_email() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.email;
    const paramOp = this.email_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError("errMsg_emailArrayHasAnInvalidString");
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_emailIsNotAValidString");
      }
    }
  }

  checkFilterParameter_fullname() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.fullname;
    const paramOp = this.fullname_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError("errMsg_fullnameArrayHasAnInvalidString");
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_fullnameIsNotAValidString");
      }
    }
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
    // filter parameters

    if (this.email !== undefined) this.checkFilterParameter_email();

    if (this.fullname !== undefined) this.checkFilterParameter_fullname();

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
    return await dbScriptListUsers(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.users, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UsersListedPublisher.Publish(this.output, this.session).catch((err) => {
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

module.exports = ListUsersManager;

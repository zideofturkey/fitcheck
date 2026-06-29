const UserAvatarsFileManager = require("./UserAvatarsFileManager");

const { dbScriptListUseravatarsfiles } = require("dbLayer");
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
  UseravatarsfilesListedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ListUserAvatarsFilesManager extends UserAvatarsFileManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listUserAvatarsFiles",
      controllerType: controllerType,
      pagination: false,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "userAvatarsFiles";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mimeType = this.mimeType;
    jsonObj.ownerId = this.ownerId;
    jsonObj.scanStatus = this.scanStatus;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mimeType = request.query?.["mimeType"];
    this.ownerId = request.query?.["ownerId"];
    this.scanStatus = request.query?.["scanStatus"];
    this.userId = request.query?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.mimeType = request.mcpParams?.["mimeType"];
    this.ownerId = request.mcpParams?.["ownerId"];
    this.scanStatus = request.mcpParams?.["scanStatus"];
    this.userId = request.mcpParams?.["userId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.mimeType === null) {
      conditionalClauses.push({ mimeType: { $isnull: true } });
    }
    if (this.mimeType != null && !Array.isArray(this.mimeType)) {
      conditionalClauses.push({
        mimeType: { $ilike: "%" + this.mimeType + "%" },
      });
    }
    if (this.mimeType != null && Array.isArray(this.mimeType)) {
      conditionalClauses.push({
        $or: this.mimeType.map((val) => ({
          mimeType: { $ilike: "%" + val + "%" },
        })),
      });
    }
    if (this.ownerId === null) {
      conditionalClauses.push({ ownerId: { $isnull: true } });
    }
    if (this.ownerId != null) {
      conditionalClauses.push({ ownerId: this.ownerId });
    }
    if (this.scanStatus === null) {
      conditionalClauses.push({ scanStatus: { $isnull: true } });
    }
    if (this.scanStatus != null && !Array.isArray(this.scanStatus)) {
      conditionalClauses.push({
        scanStatus: { $ilike: "%" + this.scanStatus + "%" },
      });
    }
    if (this.scanStatus != null && Array.isArray(this.scanStatus)) {
      conditionalClauses.push({
        $or: this.scanStatus.map((val) => ({
          scanStatus: { $ilike: "%" + val + "%" },
        })),
      });
    }
    if (this.userId === null) {
      conditionalClauses.push({ userId: { $isnull: true } });
    }
    if (this.userId != null) {
      conditionalClauses.push({ userId: this.userId });
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

  checkFilterParameter_mimeType() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.mimeType;
    const paramOp = this.mimeType_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError("errMsg_mimeTypeArrayHasAnInvalidString");
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_mimeTypeIsNotAValidString");
      }
    }
  }

  checkFilterParameter_ownerId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.ownerId;
    const paramOp = this.ownerId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_ownerIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_ownerIdIsNotAValidID");
      }
    }
  }

  checkFilterParameter_scanStatus() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.scanStatus;
    const paramOp = this.scanStatus_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError("errMsg_scanStatusArrayHasAnInvalidString");
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_scanStatusIsNotAValidString");
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

  checkParameters() {
    // filter parameters

    if (this.mimeType !== undefined) this.checkFilterParameter_mimeType();

    if (this.ownerId !== undefined) this.checkFilterParameter_ownerId();

    if (this.scanStatus !== undefined) this.checkFilterParameter_scanStatus();

    if (this.userId !== undefined) this.checkFilterParameter_userId();
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
    return await dbScriptListUseravatarsfiles(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.userAvatarsFiles, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    UseravatarsfilesListedPublisher.Publish(this.output, this.session).catch(
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

module.exports = ListUserAvatarsFilesManager;

const { runMScript } = require("common");

const DishManager = require("./DishManager");

const { dbScriptUpdateDish } = require("dbLayer");
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

class UpdateDishManager extends DishManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateDish",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dish";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.dishId = this.dishId;
    jsonObj.dishName = this.dishName;
    jsonObj.descriptionText = this.descriptionText;
    jsonObj.isGlobal = this.isGlobal;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.dishId = request.params?.["dishId"];
    this.dishName = request.body?.["dishName"];
    this.descriptionText = request.body?.["descriptionText"];
    this.isGlobal = request.body?.["isGlobal"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.dishId = this.dishId ?? this.id;
    this.id = this.dishId;
  }

  readMcpParameters(request) {
    this.dishId = request.mcpParams?.["dishId"];
    this.dishName = request.mcpParams?.["dishName"];
    this.descriptionText = request.mcpParams?.["descriptionText"];
    this.isGlobal = request.mcpParams?.["isGlobal"];
    this.requestData = request.mcpParams;

    this.dishId = this.dishId ?? this.id;
    this.id = this.dishId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return { $and: [{ id: this.dishId }, { isActive: true }] };

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  // data clause methods
  // Note: total* and totalGramWeight fields are never client-updatable here -
  // they are exclusively owned by recalculateDishTotals().

  async buildDataClause() {
    const dataClause = {
      dishName: this.dishName,
      descriptionText: this.descriptionText,
    };

    // isGlobal is admin-gated (see checkParameter_isGlobal) - only include
    // it when the client actually sent it, so omitting the field never
    // accidentally resets it to false.
    if (this.isGlobal != null) {
      dataClause.isGlobal = this.isGlobal === true;
    }

    // Resolve any Promise-valued fields.
    for (const _dcKey of Object.keys(dataClause)) {
      const _dcVal = dataClause[_dcKey];
      if (_dcVal && typeof _dcVal.then === "function") {
        dataClause[_dcKey] = await _dcVal;
      }
    }

    return dataClause;
  }

  async fetchInstance() {
    const { getDishByQuery } = require("dbLayer");

    this.dish = await getDishByQuery(this.whereClause);
    if (!this.dish) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.dish;
    this.instance = this.dish;
  }

  async checkInstance() {
    if (!this.dish) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    if (!this.checkAbsolute() && !this.userHasRole("admin")) {
      // admin (like superAdmin via checkAbsolute) fully bypasses ownership -
      // needed so an admin can promote ANY user's private record to
      // isGlobal:true, not just edit already-global records.
      if (this.dish?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      // Global records can only be modified by admins (checkAbsolute()
      // above already lets superAdmin through) - even the original owner
      // loses edit rights once a record is made global.
      if (this.dish?.isGlobal) {
        if (!this.userHasRole("admin")) {
          throw new ForbiddenError(
            "errMsg_GlobalRecordsCanOnlyBeModifiedByAdmin",
          );
        }
      } else if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_dishId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_dishId() {
    if (this.dishId == null) {
      throw new BadRequestError("errMsg_dishIdisRequired");
    }

    if (Array.isArray(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_dishId(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdTypeIsNotValid");
    }
  }

  checkParameter_dishName() {
    if (this.dishName == null) return;

    if (Array.isArray(this.dishName)) {
      throw new BadRequestError("errMsg_dishNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_descriptionText() {
    if (this.descriptionText == null) return;

    if (Array.isArray(this.descriptionText)) {
      throw new BadRequestError("errMsg_descriptionTextMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_isGlobal() {
    if (this.isGlobal == null) return;

    if (this.isGlobal !== true && this.isGlobal !== false) {
      throw new BadRequestError("errMsg_isGlobalTypeIsNotValid");
    }

    if (
      this.isGlobal === true &&
      !this.userHasRole("admin") &&
      !this.userHasRole("superAdmin")
    ) {
      throw new ForbiddenError("errMsg_OnlyAdminsCanSetGlobalFlag");
    }
  }

  checkParameters() {
    if (this.dishId === "") this.dishId = null;
    this.checkParameter_dishId();

    this.checkParameter_dishName();

    this.checkParameter_isGlobal();

    this.checkParameter_descriptionText();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.dish?.userId === this.session.userId;
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
    return await dbScriptUpdateDish(this);

    /*
    the main operation result is accessable in the context through
    this.dbResult, this.dish, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = UpdateDishManager;

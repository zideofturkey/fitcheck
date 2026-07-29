const { runMScript } = require("common");

const DishManager = require("./DishManager");

const { dbScriptListDishes } = require("dbLayer");
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

class ListDishesManager extends DishManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listDishes",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dishes";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.searchTerm = this.searchTerm;
    jsonObj.dishCategory = this.dishCategory;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.searchTerm = request.query?.["searchTerm"] ?? request.query?.["dishName"];
    this.dishCategory = request.query?.["dishCategory"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.searchTerm =
      request.mcpParams?.["searchTerm"] ?? request.mcpParams?.["dishName"];
    this.dishCategory = request.mcpParams?.["dishCategory"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    // Admins/superAdmins see every record; regular users see their own
    // plus anything marked isGlobal. Note: checkAbsolute() only covers
    // superAdmin - isGlobal visibility is a separate admin-or-superAdmin
    // rule, so it's checked directly here rather than reusing checkAbsolute().
    if (this.userHasRole("admin") || this.userHasRole("superAdmin")) {
      conditionalClauses.push({ isActive: true });
    } else {
      conditionalClauses.push({
        $and: [
          { $or: [{ userId: this.session.userId }, { isGlobal: true }] },
          { isActive: true },
        ],
      });
    }

    if (this.searchTerm) {
      conditionalClauses.push({
        dishName: { $ilike: "%" + this.searchTerm + "%" },
      });
    }
    if (this.dishCategory === null) {
      conditionalClauses.push({ dishCategory: { $isnull: true } });
    }
    if (this.dishCategory != null && !Array.isArray(this.dishCategory)) {
      conditionalClauses.push({
        dishCategory: { $ilike: "%" + this.dishCategory + "%" },
      });
    }
    if (this.dishCategory != null && Array.isArray(this.dishCategory)) {
      conditionalClauses.push({
        $or: this.dishCategory.map((val) => ({
          dishCategory: { $ilike: "%" + val + "%" },
        })),
      });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : conditionalClauses[0];

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkParameter_searchTerm() {
    if (this.searchTerm == null) return;

    if (Array.isArray(this.searchTerm)) {
      throw new BadRequestError("errMsg_searchTermMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkFilterParameter_dishCategory() {
    const paramValue = this.dishCategory;

    // null is allowed
    if (paramValue === null) return;

    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError(
            "errMsg_dishCategoryArrayHasAnInvalidString",
          );
        }
      });
    } else if (paramValue !== undefined && typeof paramValue !== "string") {
      throw new BadRequestError("errMsg_dishCategoryIsNotAValidString");
    }
  }

  checkParameters() {
    this.checkParameter_searchTerm();

    if (this.dishCategory !== undefined) this.checkFilterParameter_dishCategory();

    // filter parameters
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
    return await dbScriptListDishes(this);

    /*
    the main operation result list is accessable in the context through
    this.dbResult.items, this.dishes, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["id", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = ListDishesManager;

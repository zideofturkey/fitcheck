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
    jsonObj.ownershipFilter = this.ownershipFilter;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.searchTerm = request.query?.["searchTerm"] ?? request.query?.["dishName"];
    this.dishCategory = request.query?.["dishCategory"];
    this.ownershipFilter = request.query?.["ownershipFilter"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.searchTerm =
      request.mcpParams?.["searchTerm"] ?? request.mcpParams?.["dishName"];
    this.dishCategory = request.mcpParams?.["dishCategory"];
    this.ownershipFilter = request.mcpParams?.["ownershipFilter"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    // Everyone, including admin/superAdmin, sees only their own records plus
    // anything marked isGlobal on this normal browsing endpoint - admin's
    // "see every user's private records" capability lives exclusively in
    // the dedicated admin-user-library route (src/routes/admin-user-library.js),
    // not here.
    conditionalClauses.push({
      $and: [
        { $or: [{ userId: this.session.userId }, { isGlobal: true }] },
        { isActive: true },
      ],
    });

    // searchTerm is handled separately in buildWhereClause() via
    // turkishInsensitiveCondition(), so Turkish diacritics (ş/ğ/ü/ö/ç/ı)
    // are folded on both sides of the comparison - plain $ilike can't do
    // that, it's only case-insensitive, not diacritic-insensitive.
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
    // Layered on top of the base visibility clause above (not a replacement
    // for it) - "mine"/"global" narrow down within whatever the caller is
    // already allowed to see.
    if (this.ownershipFilter === "mine") {
      conditionalClauses.push({ userId: this.session.userId });
    } else if (this.ownershipFilter === "global") {
      conditionalClauses.push({ isGlobal: true });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : conditionalClauses[0];

    // handle permission filter later
  }

  async buildWhereClause() {
    const {
      convertUserQueryToSequelizeQuery,
      turkishInsensitiveCondition,
    } = require("common");
    const { Op } = require("sequelize");
    const routeQuery = await this.getRouteQuery();
    const sequelizeQuery = convertUserQueryToSequelizeQuery(routeQuery);
    if (this.searchTerm) {
      const searchCondition = turkishInsensitiveCondition(
        "dishName",
        this.searchTerm,
      );
      return sequelizeQuery
        ? { [Op.and]: [sequelizeQuery, searchCondition] }
        : searchCondition;
    }
    return sequelizeQuery;
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

  checkFilterParameter_ownershipFilter() {
    const paramValue = this.ownershipFilter;

    if (paramValue === null || paramValue === undefined) return;

    if (Array.isArray(paramValue)) {
      throw new BadRequestError("errMsg_ownershipFilterMustNotBeAnArray");
    }

    const enumOptions = ["all", "mine", "global"];
    if (!enumOptions.includes(paramValue)) {
      throw new BadRequestError("errMsg_ownershipFilterIsNotAValidEnumValue");
    }
  }

  checkParameters() {
    this.checkParameter_searchTerm();

    if (this.dishCategory !== undefined) this.checkFilterParameter_dishCategory();

    if (this.ownershipFilter !== undefined)
      this.checkFilterParameter_ownershipFilter();

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

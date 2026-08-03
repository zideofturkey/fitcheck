const { runMScript } = require("common");

const FoodItemManager = require("./FoodItemManager");

const { dbScriptListFooditems } = require("dbLayer");
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

class ListFoodItemsManager extends FoodItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listFoodItems",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "foodItems";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.searchTerm = this.searchTerm;
    jsonObj.foodCategory = this.foodCategory;
    jsonObj.creationSource = this.creationSource;
    jsonObj.ownershipFilter = this.ownershipFilter;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.searchTerm = request.query?.["searchTerm"];
    this.foodCategory = request.query?.["foodCategory"];
    this.creationSource = request.query?.["creationSource"];
    this.ownershipFilter = request.query?.["ownershipFilter"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.searchTerm = request.mcpParams?.["searchTerm"];
    this.foodCategory = request.mcpParams?.["foodCategory"];
    this.creationSource = request.mcpParams?.["creationSource"];
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
    conditionalClauses.push(
      runMScript(
        () => ({
          $and: [
            { $or: [{ userId: this.session.userId }, { isGlobal: true }] },
            { isActive: true },
          ],
        }),
        { path: "services[2].businessLogic[4].whereClause.fullWhereClause" },
      ),
    );

    // searchTerm is handled separately in buildWhereClause() via
    // turkishInsensitiveCondition(), so Turkish diacritics (ş/ğ/ü/ö/ç/ı)
    // are folded on both sides of the comparison - plain $ilike can't do
    // that, it's only case-insensitive, not diacritic-insensitive.
    if (this.foodCategory === null) {
      conditionalClauses.push({ foodCategory: { $isnull: true } });
    }
    if (this.foodCategory != null && !Array.isArray(this.foodCategory)) {
      conditionalClauses.push({
        foodCategory: { $ilike: "%" + this.foodCategory + "%" },
      });
    }
    if (this.foodCategory != null && Array.isArray(this.foodCategory)) {
      conditionalClauses.push({
        $or: this.foodCategory.map((val) => ({
          foodCategory: { $ilike: "%" + val + "%" },
        })),
      });
    }
    if (this.creationSource === null) {
      conditionalClauses.push({ creationSource: { $isnull: true } });
    }
    if (this.creationSource != null) {
      conditionalClauses.push({ creationSource: this.creationSource });
    }
    // Layered on top of the role-based visibility clause above (not a
    // replacement for it) - "mine"/"global" narrow down within whatever the
    // caller is already allowed to see.
    if (this.ownershipFilter === "mine") {
      conditionalClauses.push({ userId: this.session.userId });
    } else if (this.ownershipFilter === "global") {
      conditionalClauses.push({ isGlobal: true });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : !conditionalClauses.length
        ? null
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
        "foodName",
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

  checkFilterParameter_foodCategory() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.foodCategory;
    const paramOp = this.foodCategory_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // String filter validation

    // Non-array property: validate string values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        if (typeof val !== "string") {
          throw new BadRequestError(
            "errMsg_foodCategoryArrayHasAnInvalidString",
          );
        }
      });
    } else {
      if (typeof paramValue !== "string") {
        throw new BadRequestError("errMsg_foodCategoryIsNotAValidString");
      }
    }
  }

  checkFilterParameter_creationSource() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.creationSource;
    const paramOp = this.creationSource_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = ["manualentry", "aiassistant"];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_creationSourceArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_creationSourceIsNotAValidEnumValue");
      }
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

    // filter parameters

    if (this.foodCategory !== undefined)
      this.checkFilterParameter_foodCategory();

    if (this.creationSource !== undefined)
      this.checkFilterParameter_creationSource();

    if (this.ownershipFilter !== undefined)
      this.checkFilterParameter_ownershipFilter();
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
    return await dbScriptListFooditems(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.foodItems, this.data  
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

module.exports = ListFoodItemsManager;

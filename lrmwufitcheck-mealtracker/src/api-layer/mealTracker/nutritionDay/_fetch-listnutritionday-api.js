const NutritionDayManager = require("./NutritionDayManager");

const { dbScript_fetchListnutritionday } = require("dbLayer");
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

class _fetchListNutritionDayManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListNutritionDay",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "nutritionDays";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.summaryDate = this.summaryDate;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.summaryDate = request.query?.["summaryDate"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.summaryDate = request.mcpParams?.["summaryDate"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.summaryDate === null) {
      conditionalClauses.push({ summaryDate: { $isnull: true } });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate.startsWith("$lt-")
    ) {
      conditionalClauses.push({
        summaryDate: { $lt: this.summaryDate.slice(4) },
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate.startsWith("$lte-")
    ) {
      conditionalClauses.push({
        summaryDate: { $lte: this.summaryDate.slice(5) },
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate.startsWith("$gt-")
    ) {
      conditionalClauses.push({
        summaryDate: { $gt: this.summaryDate.slice(4) },
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate.startsWith("$gte-")
    ) {
      conditionalClauses.push({
        summaryDate: { $gte: this.summaryDate.slice(5) },
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate.startsWith("$btw-")
    ) {
      conditionalClauses.push({
        summaryDate: {
          $between: this.summaryDate
            .slice(5)
            .split("-")
            .map((n) => Number(n)),
        },
      });
    }
    if (this.summaryDate != null && Array.isArray(this.summaryDate)) {
      conditionalClauses.push({
        $or: this.summaryDate.map((dateStr) => ({
          $and: [
            { summaryDate: { $gte: LIB.dateFilters.getStartOfDay(dateStr) } },
            { summaryDate: { $lte: LIB.dateFilters.getEndOfDay(dateStr) } },
          ],
        })),
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      !this.summaryDate.startsWith("$")
    ) {
      conditionalClauses.push({
        $and: [
          {
            summaryDate: {
              $gte: LIB.dateFilters.getStartOfDay(this.summaryDate),
            },
          },
          {
            summaryDate: {
              $lte: LIB.dateFilters.getEndOfDay(this.summaryDate),
            },
          },
        ],
      });
    }
    if (
      this.summaryDate != null &&
      Array.isArray(this.summaryDate) &&
      this.summaryDate.every((d) => d.startsWith("$lin-"))
    ) {
      conditionalClauses.push({
        $or: this.summaryDate.map((dateStr) => ({
          $and: [
            {
              summaryDate: {
                $gte: LIB.dateFilters.getStartOfDayLocal(
                  dateStr.slice(5),
                  this.session.timezone,
                ),
              },
            },
            {
              summaryDate: {
                $lte: LIB.dateFilters.getEndOfDayLocal(
                  dateStr.slice(5),
                  this.session.timezone,
                ),
              },
            },
          ],
        })),
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate.startsWith("$leq-")
    ) {
      conditionalClauses.push({
        $and: [
          {
            summaryDate: {
              $gte: LIB.dateFilters.getStartOfDayLocal(
                this.summaryDate.slice(5),
                this.session.timezone,
              ),
            },
          },
          {
            summaryDate: {
              $lte: LIB.dateFilters.getEndOfDayLocal(
                this.summaryDate.slice(5),
                this.session.timezone,
              ),
            },
          },
        ],
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate == "$today"
    ) {
      conditionalClauses.push({
        $and: [
          { summaryDate: { $gte: LIB.dateFilters.getStartOfToday() } },
          { summaryDate: { $lte: LIB.dateFilters.getEndOfToday() } },
        ],
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate == "$ltoday"
    ) {
      conditionalClauses.push({
        $and: [
          {
            summaryDate: {
              $gte: LIB.dateFilters.getStartOfTodayLocal(this.session.timezone),
            },
          },
          {
            summaryDate: {
              $lte: LIB.dateFilters.getEndOfTodayLocal(this.session.timezone),
            },
          },
        ],
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate == "$week"
    ) {
      conditionalClauses.push({
        $and: [
          { summaryDate: { $gte: LIB.dateFilters.getStartOfThisWeek() } },
          { summaryDate: { $lte: LIB.dateFilters.getEndOfThisWeek() } },
        ],
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate == "$lweek"
    ) {
      conditionalClauses.push({
        $and: [
          {
            summaryDate: {
              $gte: LIB.dateFilters.getStartOfThisWeekLocal(
                this.session.timezone,
              ),
            },
          },
          {
            summaryDate: {
              $lte: LIB.dateFilters.getEndOfThisWeekLocal(
                this.session.timezone,
              ),
            },
          },
        ],
      });
    }
    if (
      this.summaryDate != null &&
      !Array.isArray(this.summaryDate) &&
      this.summaryDate == "$month"
    ) {
      conditionalClauses.push({
        $and: [
          { summaryDate: { $gte: LIB.dateFilters.getStartOfThisMonth() } },
          { summaryDate: { $lte: LIB.dateFilters.getEndOfThisMonth() } },
        ],
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

  checkFilterParameter_summaryDate() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.summaryDate;
    const paramOp = this.summaryDate_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Date filter validation
    // Date filtering on array properties is not supported (always uses non-array logic)
    const validDateOperators = [
      "$today",
      "$ltoday",
      "$week",
      "$lweek",
      "$month",
    ];
    const validLocalDateOperators = ["$leq-", "$lin-"];

    if (Array.isArray(paramValue)) {
      // Array of dates: validate each date
      paramValue.forEach((dateVal) => {
        if (typeof dateVal === "string") {
          if (dateVal.startsWith("$lin-")) {
            // Local date in array: validate the date part
            const datePart = dateVal.slice(5);
            const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
            if (!isDate(datePart)) {
              throw new BadRequestError(
                "errMsg_summaryDateArrayHasAnInvalidDate",
              );
            }
          } else if (!validDateOperators.includes(dateVal)) {
            // Regular date string
            const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
            if (!isDate(dateVal)) {
              throw new BadRequestError(
                "errMsg_summaryDateArrayHasAnInvalidDate",
              );
            }
          }
        } else {
          // Direct date value
          const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
          if (!isDate(dateVal)) {
            throw new BadRequestError(
              "errMsg_summaryDateArrayHasAnInvalidDate",
            );
          }
        }
      });
    } else {
      if (typeof paramValue === "string") {
        // Check for special date operators
        if (validDateOperators.includes(paramValue)) {
          // Valid special operator, no validation needed
        } else if (paramValue.startsWith("$leq-")) {
          // Local date equality: validate the date part
          const datePart = paramValue.slice(5);
          const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
          if (!isDate(datePart)) {
            throw new BadRequestError(
              "errMsg_summaryDateLocalDateOperatorRequiresValidDate",
            );
          }
        } else if (!paramValue.startsWith("$")) {
          // Regular date string
          const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
          if (!isDate(paramValue)) {
            throw new BadRequestError("errMsg_summaryDateIsNotAValidDate");
          }
        }
      } else {
        // Direct date value
        const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
        if (!isDate(paramValue)) {
          throw new BadRequestError("errMsg_summaryDateIsNotAValidDate");
        }
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.summaryDate !== undefined) this.checkFilterParameter_summaryDate();
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
    return await dbScript_fetchListnutritionday(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.nutritionDays, this.data  
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

module.exports = _fetchListNutritionDayManager;

const { runMScript } = require("common");

const NutritionDayManager = require("./NutritionDayManager");

const { dbScriptListNutritiondays } = require("dbLayer");
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

class ListNutritionDaysManager extends NutritionDayManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listNutritionDays",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 30,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "nutritionDays";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.fromDate = this.fromDate;
    jsonObj.toDate = this.toDate;
    jsonObj.summaryDate = this.summaryDate;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.fromDate = request.query?.["fromDate"];
    this.toDate = request.query?.["toDate"];
    this.summaryDate = request.query?.["summaryDate"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.fromDate = request.mcpParams?.["fromDate"];
    this.toDate = request.mcpParams?.["toDate"];
    this.summaryDate = request.mcpParams?.["summaryDate"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(
        () => ({
          $and: [
            { userId: this.session.userId },
            { userId: this.session?.userId },
          ],
        }),
        { path: "services[3].businessLogic[11].whereClause.fullWhereClause" },
      ),
    );

    if (
      runMScript(() => this.fromDate != null, {
        path: "services[3].businessLogic[11].whereClause.additionalClauses[0].condition",
      })
    ) {
      conditionalClauses.push(
        runMScript(() => ({ summaryDate: { $gte: this.fromDate } }), {
          path: "services[3].businessLogic[11].whereClause.additionalClauses[0].whereClause",
        }),
      );
    }
    if (
      runMScript(() => this.toDate != null, {
        path: "services[3].businessLogic[11].whereClause.additionalClauses[1].condition",
      })
    ) {
      conditionalClauses.push(
        runMScript(() => ({ summaryDate: { $lte: this.toDate } }), {
          path: "services[3].businessLogic[11].whereClause.additionalClauses[1].whereClause",
        }),
      );
    }
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

  checkParameterType_fromDate(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_fromDate() {
    if (this.fromDate == null) return;

    if (Array.isArray(this.fromDate)) {
      throw new BadRequestError("errMsg_fromDateMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_fromDate(this.fromDate)) {
      throw new BadRequestError("errMsg_fromDateTypeIsNotValid");
    }
  }

  checkParameterType_toDate(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_toDate() {
    if (this.toDate == null) return;

    if (Array.isArray(this.toDate)) {
      throw new BadRequestError("errMsg_toDateMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_toDate(this.toDate)) {
      throw new BadRequestError("errMsg_toDateTypeIsNotValid");
    }
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
    this.checkParameter_fromDate();

    this.checkParameter_toDate();

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
    return await dbScriptListNutritiondays(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.nutritionDays, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["summaryDate", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = ListNutritionDaysManager;

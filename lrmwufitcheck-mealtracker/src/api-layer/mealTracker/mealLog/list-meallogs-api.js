const { runMScript } = require("common");

const MealLogManager = require("./MealLogManager");

const { dbScriptListMeallogs } = require("dbLayer");
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

class ListMealLogsManager extends MealLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listMealLogs",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLogs";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.fromDate = this.fromDate;
    jsonObj.toDate = this.toDate;
    jsonObj.mealDate = this.mealDate;
    jsonObj.logSource = this.logSource;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.fromDate = request.query?.["fromDate"];
    this.toDate = request.query?.["toDate"];
    this.mealDate = request.query?.["mealDate"];
    this.logSource = request.query?.["logSource"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.fromDate = request.mcpParams?.["fromDate"];
    this.toDate = request.mcpParams?.["toDate"];
    this.mealDate = request.mcpParams?.["mealDate"];
    this.logSource = request.mcpParams?.["logSource"];
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
        { path: "services[3].businessLogic[2].whereClause.fullWhereClause" },
      ),
    );

    if (
      runMScript(() => this.fromDate != null, {
        path: "services[3].businessLogic[2].whereClause.additionalClauses[0].condition",
      })
    ) {
      conditionalClauses.push(
        // Pass an actual Date instance, not the raw "YYYY-MM-DD" string:
        // Sequelize's DATE serializer re-parses plain strings using local-
        // timezone semantics, which silently shifts the value by the host's
        // UTC offset and misses rows stored at true UTC midnight (native
        // `new Date()` parses ISO date-only strings as UTC, per spec).
        runMScript(() => ({ mealDate: { $gte: new Date(this.fromDate) } }), {
          path: "services[3].businessLogic[2].whereClause.additionalClauses[0].whereClause",
        }),
      );
    }
    if (
      runMScript(() => this.toDate != null, {
        path: "services[3].businessLogic[2].whereClause.additionalClauses[1].condition",
      })
    ) {
      conditionalClauses.push(
        runMScript(() => ({ mealDate: { $lte: new Date(this.toDate) } }), {
          path: "services[3].businessLogic[2].whereClause.additionalClauses[1].whereClause",
        }),
      );
    }
    if (this.mealDate === null) {
      conditionalClauses.push({ mealDate: { $isnull: true } });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate.startsWith("$lt-")
    ) {
      conditionalClauses.push({ mealDate: { $lt: this.mealDate.slice(4) } });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate.startsWith("$lte-")
    ) {
      conditionalClauses.push({ mealDate: { $lte: this.mealDate.slice(5) } });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate.startsWith("$gt-")
    ) {
      conditionalClauses.push({ mealDate: { $gt: this.mealDate.slice(4) } });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate.startsWith("$gte-")
    ) {
      conditionalClauses.push({ mealDate: { $gte: this.mealDate.slice(5) } });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate.startsWith("$btw-")
    ) {
      conditionalClauses.push({
        mealDate: {
          $between: this.mealDate
            .slice(5)
            .split("-")
            .map((n) => Number(n)),
        },
      });
    }
    if (this.mealDate != null && Array.isArray(this.mealDate)) {
      conditionalClauses.push({
        $or: this.mealDate.map((dateStr) => ({
          $and: [
            { mealDate: { $gte: LIB.dateFilters.getStartOfDay(dateStr) } },
            { mealDate: { $lte: LIB.dateFilters.getEndOfDay(dateStr) } },
          ],
        })),
      });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      !this.mealDate.startsWith("$")
    ) {
      conditionalClauses.push({
        $and: [
          { mealDate: { $gte: LIB.dateFilters.getStartOfDay(this.mealDate) } },
          { mealDate: { $lte: LIB.dateFilters.getEndOfDay(this.mealDate) } },
        ],
      });
    }
    if (
      this.mealDate != null &&
      Array.isArray(this.mealDate) &&
      this.mealDate.every((d) => d.startsWith("$lin-"))
    ) {
      conditionalClauses.push({
        $or: this.mealDate.map((dateStr) => ({
          $and: [
            {
              mealDate: {
                $gte: LIB.dateFilters.getStartOfDayLocal(
                  dateStr.slice(5),
                  this.session.timezone,
                ),
              },
            },
            {
              mealDate: {
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
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate.startsWith("$leq-")
    ) {
      conditionalClauses.push({
        $and: [
          {
            mealDate: {
              $gte: LIB.dateFilters.getStartOfDayLocal(
                this.mealDate.slice(5),
                this.session.timezone,
              ),
            },
          },
          {
            mealDate: {
              $lte: LIB.dateFilters.getEndOfDayLocal(
                this.mealDate.slice(5),
                this.session.timezone,
              ),
            },
          },
        ],
      });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate == "$today"
    ) {
      conditionalClauses.push({
        $and: [
          { mealDate: { $gte: LIB.dateFilters.getStartOfToday() } },
          { mealDate: { $lte: LIB.dateFilters.getEndOfToday() } },
        ],
      });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate == "$ltoday"
    ) {
      conditionalClauses.push({
        $and: [
          {
            mealDate: {
              $gte: LIB.dateFilters.getStartOfTodayLocal(this.session.timezone),
            },
          },
          {
            mealDate: {
              $lte: LIB.dateFilters.getEndOfTodayLocal(this.session.timezone),
            },
          },
        ],
      });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate == "$week"
    ) {
      conditionalClauses.push({
        $and: [
          { mealDate: { $gte: LIB.dateFilters.getStartOfThisWeek() } },
          { mealDate: { $lte: LIB.dateFilters.getEndOfThisWeek() } },
        ],
      });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate == "$lweek"
    ) {
      conditionalClauses.push({
        $and: [
          {
            mealDate: {
              $gte: LIB.dateFilters.getStartOfThisWeekLocal(
                this.session.timezone,
              ),
            },
          },
          {
            mealDate: {
              $lte: LIB.dateFilters.getEndOfThisWeekLocal(
                this.session.timezone,
              ),
            },
          },
        ],
      });
    }
    if (
      this.mealDate != null &&
      !Array.isArray(this.mealDate) &&
      this.mealDate == "$month"
    ) {
      conditionalClauses.push({
        $and: [
          { mealDate: { $gte: LIB.dateFilters.getStartOfThisMonth() } },
          { mealDate: { $lte: LIB.dateFilters.getEndOfThisMonth() } },
        ],
      });
    }
    if (this.logSource === null) {
      conditionalClauses.push({ logSource: { $isnull: true } });
    }
    if (this.logSource != null) {
      conditionalClauses.push({ logSource: this.logSource });
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

  checkFilterParameter_mealDate() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.mealDate;
    const paramOp = this.mealDate_op;

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
              throw new BadRequestError("errMsg_mealDateArrayHasAnInvalidDate");
            }
          } else if (!validDateOperators.includes(dateVal)) {
            // Regular date string
            const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
            if (!isDate(dateVal)) {
              throw new BadRequestError("errMsg_mealDateArrayHasAnInvalidDate");
            }
          }
        } else {
          // Direct date value
          const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
          if (!isDate(dateVal)) {
            throw new BadRequestError("errMsg_mealDateArrayHasAnInvalidDate");
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
              "errMsg_mealDateLocalDateOperatorRequiresValidDate",
            );
          }
        } else if (!paramValue.startsWith("$")) {
          // Regular date string
          const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
          if (!isDate(paramValue)) {
            throw new BadRequestError("errMsg_mealDateIsNotAValidDate");
          }
        }
      } else {
        // Direct date value
        const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
        if (!isDate(paramValue)) {
          throw new BadRequestError("errMsg_mealDateIsNotAValidDate");
        }
      }
    }
  }

  checkFilterParameter_logSource() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.logSource;
    const paramOp = this.logSource_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Enum filter validation

    // Non-array property: validate enum values
    const enumOptions = [
      "foodlibrary",
      "presettemplate",
      "dishtemplate",
      "manualentry",
      "aiassistant",
    ];
    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        const enumVal = typeof val === "string" ? val.toLowerCase() : val;
        if (!enumOptions.includes(enumVal)) {
          throw new BadRequestError(
            "errMsg_logSourceArrayHasAnInvalidEnumValue",
          );
        }
      });
    } else {
      const enumVal =
        typeof paramValue === "string" ? paramValue.toLowerCase() : paramValue;
      if (!enumOptions.includes(enumVal)) {
        throw new BadRequestError("errMsg_logSourceIsNotAValidEnumValue");
      }
    }
  }

  checkParameters() {
    this.checkParameter_fromDate();

    this.checkParameter_toDate();

    // filter parameters

    if (this.mealDate !== undefined) this.checkFilterParameter_mealDate();

    if (this.logSource !== undefined) this.checkFilterParameter_logSource();
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
    return await dbScriptListMeallogs(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.mealLogs, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["mealDate", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = ListMealLogsManager;

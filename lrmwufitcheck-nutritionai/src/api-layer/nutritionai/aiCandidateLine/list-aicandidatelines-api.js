const { runMScript } = require("common");

const AiCandidateLineManager = require("./AiCandidateLineManager");

const {
  dbScript_fetchListaicandidateline,
  getAiCandidateMealByQuery,
} = require("dbLayer");
const {
  HttpServerError,
  BadRequestError,
  ForbiddenError,
  isValidUUID,
} = require("common");

/***********************************************************************
 ** User-facing list endpoint for aiCandidateLine, scoped to the caller's
 ** own session.userId. The Mindbricks-generated `_fetchlistaicandidateline`
 ** route is admin-only (checkBasicAuth requires superAdmin/admin) and was
 ** never meant for a regular user to read their own AI-suggested meal's
 ** line items - this is the missing regular-user counterpart, following
 ** the same pattern as ListAiCandidateMealsManager.
 ***********************************************************************/
class ListAiCandidateLinesManager extends AiCandidateLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listAiCandidateLines",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 50,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiCandidateMealId = this.aiCandidateMealId;
    jsonObj.aiSessionId = this.aiSessionId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiCandidateMealId = request.query?.["aiCandidateMealId"];
    this.aiSessionId = request.query?.["aiSessionId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.aiCandidateMealId = request.mcpParams?.["aiCandidateMealId"];
    this.aiSessionId = request.mcpParams?.["aiSessionId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  checkParameter_aiCandidateMealId() {
    if (this.aiCandidateMealId == null) return;
    if (Array.isArray(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdMustNotBeAnArray");
    }
    if (!isValidUUID(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdIsNotAValidID");
    }
  }

  checkParameter_aiSessionId() {
    if (this.aiSessionId == null) return;
    if (Array.isArray(this.aiSessionId)) {
      throw new BadRequestError("errMsg_aiSessionIdMustNotBeAnArray");
    }
    if (!isValidUUID(this.aiSessionId)) {
      throw new BadRequestError("errMsg_aiSessionIdIsNotAValidID");
    }
  }

  checkParameters() {
    this.checkParameter_aiCandidateMealId();
    this.checkParameter_aiSessionId();
  }

  // aiCandidateLine only stores aiCandidateMealId, not aiSessionId directly.
  // When the caller filters by aiSessionId (e.g. right after parse-meal,
  // before it knows the candidate meal's own id), resolve it here to the
  // owning candidate meal's id so the where clause still narrows correctly
  // instead of silently ignoring the filter and returning every line the
  // user has ever had.
  async afterCheckParameters() {
    if (this.aiSessionId && !this.aiCandidateMealId) {
      const meal = await getAiCandidateMealByQuery({
        aiSessionId: this.aiSessionId,
        userId: this.session.userId,
      });
      this.aiCandidateMealId = meal?.id ?? "00000000-0000-0000-0000-000000000000";
    }
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;
    if (this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async getRouteQuery() {
    const conditionalClauses = [
      runMScript(() => ({ userId: this.session.userId }), {
        path: "custom.ownershipScope",
      }),
    ];

    if (this.aiCandidateMealId != null) {
      conditionalClauses.push({ aiCandidateMealId: this.aiCandidateMealId });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : conditionalClauses[0];
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async executeMainOperation() {
    return await dbScript_fetchListaicandidateline(this);
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["createdAt", "ASC"]];
  }
}

module.exports = ListAiCandidateLinesManager;

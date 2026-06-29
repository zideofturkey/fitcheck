const { runMScript } = require("common");

const PresetLineManager = require("./PresetLineManager");

const { dbScriptDeletePresetline, getPresetMealByQuery } = require("dbLayer");
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

class DeletePresetLineManager extends PresetLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deletePresetLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.presetLineId = this.presetLineId;
    jsonObj.presetMealId = this.presetMealId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.presetLineId = request.params?.["presetLineId"];
    this.presetMealId = request.params?.["presetMealId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.presetLineId = this.presetLineId ?? this.id;
    this.id = this.presetLineId;
  }

  readMcpParameters(request) {
    this.presetLineId = request.mcpParams?.["presetLineId"];
    this.presetMealId = request.mcpParams?.["presetMealId"];
    this.requestData = request.mcpParams;

    this.presetLineId = this.presetLineId ?? this.id;
    this.id = this.presetLineId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({
        $and: [
          { id: this.presetLineId, presetMealId: this.presetMealId },
          { isActive: true },
        ],
      }),
      { path: "services[2].businessLogic[14].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async fetchInstance() {
    const { getPresetLineByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.presetLine = await getPresetLineByQuery(this.whereClause);
    if (!this.presetLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.presetLine;
    this.instance = this.presetLine;
  }

  async checkInstance() {
    if (!this.presetLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_presetLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_presetLineId() {
    if (this.presetLineId == null) {
      throw new BadRequestError("errMsg_presetLineIdisRequired");
    }

    if (Array.isArray(this.presetLineId)) {
      throw new BadRequestError("errMsg_presetLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_presetLineId(this.presetLineId)) {
      throw new BadRequestError("errMsg_presetLineIdTypeIsNotValid");
    }
  }

  checkParameter_presetMealId() {
    if (this.presetMealId == null) {
      throw new BadRequestError("errMsg_presetMealIdisRequired");
    }

    if (Array.isArray(this.presetMealId)) {
      throw new BadRequestError("errMsg_presetMealIdMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameters() {
    if (this.presetLineId === "") this.presetLineId = null;
    this.checkParameter_presetLineId();

    this.checkParameter_presetMealId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.presetLine?._owner === this.session.userId;
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
    return await dbScriptDeletePresetline(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.presetLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentPreset = await this.fetchParentPresetForDelete();
    } catch (err) {
      console.log("fetchParentPresetForDelete Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validatePresetOwnershipForDelete();
    } catch (err) {
      console.log(
        "validatePresetOwnershipForDelete Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
  }

  async afterMainDeleteOperation() {
    try {
      await this.recalcPresetTotalsAfterDelete();
    } catch (err) {
      console.log("recalcPresetTotalsAfterDelete Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Ensure the preset belongs to the authenticated user
   ***********************************************************************/

  async validatePresetOwnershipForDelete() {
    if (this.checkAbsolute()) return true;

    let isValid;
    try {
      isValid = runMScript(() => this.parentPreset != null, {
        path: "services[2].businessLogic[14].actions.validationActions[0].validationScript",
      });
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isValid && typeof isValid.then === "function") {
        isValid = await isValid;
      }
    } catch (err) {
      // Designer-emitted 4xx throws (BadRequestError, ForbiddenError,
      // NotFoundError, ConflictError, UnprocessableEntityError, …) propagate
      // verbatim — the MScript intentionally surfaced a typed business
      // validation failure and its message belongs in the response. Only
      // wrap genuinely unexpected exceptions (TypeError, ReferenceError,
      // null-deref, etc.) as 500 so operators can tell "rule rejected
      // input" from "the validation itself crashed".
      if (
        err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
      ) {
        throw err;
      }
      throw new HttpServerError(
        `Validation 'validatePresetOwnershipForDelete' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new ForbiddenError("Preset meal not found or access denied");
    }
    return isValid;
  }

  /***********************************************************************
   ** Fetch parent preset to validate ownership before deleting a line
   ***********************************************************************/
  async fetchParentPresetForDelete() {
    // Fetch Object on childObject presetMeal

    const userQuery = {
      $and: [
        runMScript(
          () => ({
            id: this.presetMealId,
            userId: this.session.userId,
            isActive: true,
          }),
          {
            path: "services[2].businessLogic[14].actions.fetchObjectActions[0].whereClause",
          },
        ),
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getPresetMealByQuery(scriptQuery);

    return data;
  }

  /***********************************************************************
   ** Recalculate preset totals after line deletion
   ***********************************************************************/

  async recalcPresetTotalsAfterDelete() {
    try {
      return runMScript(() => LIB.recalculatePresetTotals(this.presetMealId), {
        path: "services[2].businessLogic[14].actions.functionCallActions[0].callScript",
      });
    } catch (err) {
      console.error(
        "Error in FunctionCallAction recalcPresetTotalsAfterDelete:",
        err,
      );
      throw err;
    }
  }
}

module.exports = DeletePresetLineManager;

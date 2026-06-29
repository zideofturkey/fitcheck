const { runMScript } = require("common");

const PresetLineManager = require("./PresetLineManager");

const {
  dbScriptListPresetlines,
  getPresetMealByQuery,
  getFoodItemListByQuery,
} = require("dbLayer");
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
  convertUserQueryToSequelizeQuery,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ListPresetLinesManager extends PresetLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listPresetLines",
      controllerType: controllerType,
      pagination: false,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.presetMealId = this.presetMealId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.presetMealId = request.params?.["presetMealId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.presetMealId = request.mcpParams?.["presetMealId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({
        $and: [{ presetMealId: this.presetMealId }, { isActive: true }],
      }),
      { path: "services[2].businessLogic[13].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
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
    this.checkParameter_presetMealId();

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

  async fetchJoined_food(presetlines) {
    // relation to foodItem

    if (!presetlines) {
      console.log(
        "presetlines is null, so fetchJoined_presetlines is ommitted",
      );
      return;
    }

    const foreignKey = presetlines.map((item) => item.foodItemId);

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getFoodItemListByQuery(scriptQuery)) ?? [];

    const foodList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["foodName"] = item["foodName"];
      newItem["caloriePer100g"] = item["caloriePer100g"];
      newItem["proteinPer100g"] = item["proteinPer100g"];
      newItem["carbohydratePer100g"] = item["carbohydratePer100g"];
      newItem["fatPer100g"] = item["fatPer100g"];
      newItem["sugarPer100g"] = item["sugarPer100g"];
      newItem["fiberPer100g"] = item["fiberPer100g"];
      return newItem;
    });

    for (const item of foodList) {
      const mainItems = presetlines.filter(
        (mItem) => mItem.foodItemId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.food = item;
      }
    }
  }

  async fetchJoinsToMainObject(presetlines) {
    await this.fetchJoined_food(presetlines);
  }

  async executeMainOperation() {
    return await dbScriptListPresetlines(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.presetLines, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["id", "DESC"]];
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.parentPreset = await this.fetchParentPresetForList();
    } catch (err) {
      console.log("fetchParentPresetForList Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.validatePresetOwnershipForList();
    } catch (err) {
      console.log("validatePresetOwnershipForList Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Ensure the preset belongs to the authenticated user
   ***********************************************************************/

  async validatePresetOwnershipForList() {
    if (this.checkAbsolute()) return true;

    let isValid;
    try {
      isValid = runMScript(() => this.parentPreset != null, {
        path: "services[2].businessLogic[13].actions.validationActions[0].validationScript",
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
        `Validation 'validatePresetOwnershipForList' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new ForbiddenError("Preset meal not found or access denied");
    }
    return isValid;
  }

  /***********************************************************************
   ** Fetch parent preset to validate ownership before listing lines
   ***********************************************************************/
  async fetchParentPresetForList() {
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
            path: "services[2].businessLogic[13].actions.fetchObjectActions[0].whereClause",
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
}

module.exports = ListPresetLinesManager;

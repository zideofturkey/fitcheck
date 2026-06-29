const {
  HttpServerError,
  BadRequestError,
  hasArrayMutations,
  resolveArrayMutationsInClause,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { MacroTarget } = require("models");
const { Op } = require("sequelize");
const { ElasticIndexer } = require("serviceCommon");
const {
  indexDataToElastic,
  raiseDbEventUpdate,
  updateEntityCache,
  invalidateQueryCache,
} = require("./helper");

/**
 * Updates all MacroTarget records matching an MScript Query.
 * @param {Object} dataClause - Fields to update
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @param {Object} [context=null] - Context with session and requestId
 * @returns {Promise<Array<Object>>} Array of updated records
 */
const updateMacroTargetByMQuery = async (
  dataClause,
  mQuery,
  context = null,
) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    let rows = [];
    const appliedDataById = new Map();

    // Default soft-delete filter only when the caller did not explicitly set isActive
    const whereClause = Object.prototype.hasOwnProperty.call(query, "isActive")
      ? query
      : { [Op.and]: [query, { isActive: true }] };

    if (hasArrayMutations(dataClause)) {
      const existingRows = await MacroTarget.findAll({ where: whereClause });
      for (const item of existingRows) {
        const resolvedDataClause = resolveArrayMutationsInClause(
          dataClause,
          item.getData(),
        );
        const updateResult = await MacroTarget.update(resolvedDataClause, {
          where: { id: item.id },
          returning: true,
        });
        const updatedItem = updateResult[1]?.[0] ?? null;
        if (updatedItem) {
          rows.push(updatedItem);
          appliedDataById.set(updatedItem.id, resolvedDataClause);
        }
      }
    } else {
      const options = { where: whereClause, returning: true };
      [, rows] = await MacroTarget.update(dataClause, options);
    }

    if (!rows.length) return [];

    const resultList = [];
    for (const item of rows) {
      const _data = item.getData();
      await updateEntityCache(_data);
      await indexDataToElastic(_data, context);
      await invalidateQueryCache(_data);
      const appliedDataClause = appliedDataById.get(item.id) ?? dataClause;
      await raiseDbEventUpdate(_data, null, appliedDataClause, context);
      resultList.push(_data);
    }

    return resultList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingMacroTargetByMQuery",
      err,
    );
  }
};

module.exports = updateMacroTargetByMQuery;

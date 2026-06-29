const {
  HttpServerError,
  BadRequestError,
  hasArrayMutations,
  resolveArrayMutationsInClause,
} = require("common");

const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");
const { ElasticIndexer } = require("serviceCommon");
const {
  indexDataToElastic,
  raiseDbEventUpdate,
  updateEntityCache,
  invalidateQueryCache,
} = require("./helper");

/**
 * @deprecated Use updateSys_agentConversationByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const updateSys_agentConversationByQuery = async (
  dataClause,
  query,
  context = null,
) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    let rows = [];
    const appliedDataById = new Map();

    const whereClause = query;

    if (hasArrayMutations(dataClause)) {
      const existingRows = await Sys_agentConversation.findAll({
        where: whereClause,
      });
      for (const item of existingRows) {
        const resolvedDataClause = resolveArrayMutationsInClause(
          dataClause,
          item.getData(),
        );
        const updateResult = await Sys_agentConversation.update(
          resolvedDataClause,
          { where: { id: item.id }, returning: true },
        );
        const updatedItem = updateResult[1]?.[0] ?? null;
        if (updatedItem) {
          rows.push(updatedItem);
          appliedDataById.set(updatedItem.id, resolvedDataClause);
        }
      }
    } else {
      const options = { where: whereClause, returning: true };
      [, rows] = await Sys_agentConversation.update(dataClause, options);
    }

    if (!rows.length) return [];

    const resultList = [];
    for (const item of rows) {
      const _data = item.getData();
      await updateEntityCache(_data);
      await indexDataToElastic(_data, context);
      await invalidateQueryCache(_data);
      // For query-based updates, we don't have old data, so pass null
      const appliedDataClause = appliedDataById.get(item.id) ?? dataClause;
      await raiseDbEventUpdate(_data, null, appliedDataClause, context);
      resultList.push(_data);
    }

    return resultList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingSys_agentConversationByQuery",
      err,
    );
  }
};

module.exports = updateSys_agentConversationByQuery;

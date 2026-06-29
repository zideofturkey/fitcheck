const { HttpServerError, BadRequestError } = require("common");
const { MealLine } = require("models");
const { Op } = require("sequelize");
const {
  deleteDataFromElastic,
  raiseDbEventDelete,
  deleteEntityCache,
  invalidateQueryCache,
} = require("./helper");

/**
 * @deprecated Use deleteMealLineByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const deleteMealLineByQuery = async (query, context = null) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const rows = await MealLine.findAll({ where: query });
    if (!rows || rows.length === 0) return [];

    await MealLine.destroy({ where: query });

    const resultList = [];
    for (const item of rows) {
      const _data = item.getData();
      await deleteEntityCache(item.id);
      await deleteDataFromElastic(item.id, context);
      await invalidateQueryCache(_data);
      await raiseDbEventDelete(_data, context);
      resultList.push(_data);
    }

    return resultList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenDeletingMealLineByQuery", err);
  }
};

module.exports = deleteMealLineByQuery;

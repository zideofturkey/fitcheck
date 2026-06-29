const { HttpServerError, hasArrayMutations, resolveArrayMutationsInClause } =
  require("common");

const { FoodItem } = require("models");
const { Op } = require("sequelize");
const {
  indexDataToElastic,
  raiseDbEventUpdate,
  updateEntityCache,
  invalidateQueryCache,
} = require("./helper");

const updateFoodItemByIdList = async (idList, dataClause, context = null) => {
  try {
    let rows = [];
    const appliedDataById = new Map();

    const whereClause = { id: { [Op.in]: idList }, isActive: true };

    if (hasArrayMutations(dataClause)) {
      const existingRows = await FoodItem.findAll({ where: whereClause });
      for (const item of existingRows) {
        const resolvedDataClause = resolveArrayMutationsInClause(
          dataClause,
          item.getData(),
        );
        const updateResult = await FoodItem.update(resolvedDataClause, {
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
      [, rows] = await FoodItem.update(dataClause, options);
    }

    for (const item of rows) {
      const _data = item.getData();
      await updateEntityCache(_data);
      await indexDataToElastic(_data, context);
      await invalidateQueryCache(_data);
      // For bulk updates, we don't have old data, so pass null
      const appliedDataClause = appliedDataById.get(item.id) ?? dataClause;
      await raiseDbEventUpdate(_data, null, appliedDataClause, context);
    }

    const foodItemIdList = rows.map((item) => item.id);
    return foodItemIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingFoodItemByIdList",
      err,
    );
  }
};

module.exports = updateFoodItemByIdList;

const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MacroTarget, FoodItem, PresetMeal, PresetLine, Dish, DishLine } = require("models");
const { Op } = require("sequelize");

const getPresetMealAggById = async (presetMealId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const presetMeal = Array.isArray(presetMealId)
      ? await PresetMeal.findAll({
          where: {
            id: { [Op.in]: presetMealId },
            isActive: true,
          },
          include: includes,
        })
      : await PresetMeal.findOne({
          where: {
            id: presetMealId,
            isActive: true,
          },
          include: includes,
        });

    if (!presetMeal) {
      return null;
    }

    const presetMealData =
      Array.isArray(presetMealId) && presetMealId.length > 0
        ? presetMeal.map((item) => item.getData())
        : presetMeal.getData();
    await PresetMeal.getCqrsJoins(presetMealData);
    return presetMealData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetMealAggById",
      err,
    );
  }
};

module.exports = getPresetMealAggById;

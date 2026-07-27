const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MacroTarget, FoodItem, PresetMeal, PresetLine, Dish, DishLine } = require("models");
const { Op } = require("sequelize");

const getDishLineAggById = async (dishLineId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const dishLine = Array.isArray(dishLineId)
      ? await DishLine.findAll({
          where: {
            id: { [Op.in]: dishLineId },
            isActive: true,
          },
          include: includes,
        })
      : await DishLine.findOne({
          where: {
            id: dishLineId,
            isActive: true,
          },
          include: includes,
        });

    if (!dishLine) {
      return null;
    }

    const dishLineData =
      Array.isArray(dishLineId) && dishLineId.length > 0
        ? dishLine.map((item) => item.getData())
        : dishLine.getData();
    await DishLine.getCqrsJoins(dishLineData);
    return dishLineData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishLineAggById",
      err,
    );
  }
};

module.exports = getDishLineAggById;

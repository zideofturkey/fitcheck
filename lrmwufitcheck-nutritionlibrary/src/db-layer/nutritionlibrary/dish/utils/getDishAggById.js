const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MacroTarget, FoodItem, PresetMeal, PresetLine, Dish, DishLine } = require("models");
const { Op } = require("sequelize");

const getDishAggById = async (dishId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const dish = Array.isArray(dishId)
      ? await Dish.findAll({
          where: {
            id: { [Op.in]: dishId },
            isActive: true,
          },
          include: includes,
        })
      : await Dish.findOne({
          where: {
            id: dishId,
            isActive: true,
          },
          include: includes,
        });

    if (!dish) {
      return null;
    }

    const dishData =
      Array.isArray(dishId) && dishId.length > 0
        ? dish.map((item) => item.getData())
        : dish.getData();
    await Dish.getCqrsJoins(dishData);
    return dishData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishAggById",
      err,
    );
  }
};

module.exports = getDishAggById;

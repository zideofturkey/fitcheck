const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MacroTarget, FoodItem, PresetMeal, PresetLine } = require("models");
const { Op } = require("sequelize");

const getFoodItemAggById = async (foodItemId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const foodItem = Array.isArray(foodItemId)
      ? await FoodItem.findAll({
          where: {
            id: { [Op.in]: foodItemId },
            isActive: true,
          },
          include: includes,
        })
      : await FoodItem.findOne({
          where: {
            id: foodItemId,
            isActive: true,
          },
          include: includes,
        });

    if (!foodItem) {
      return null;
    }

    const foodItemData =
      Array.isArray(foodItemId) && foodItemId.length > 0
        ? foodItem.map((item) => item.getData())
        : foodItem.getData();
    await FoodItem.getCqrsJoins(foodItemData);
    return foodItemData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFoodItemAggById",
      err,
    );
  }
};

module.exports = getFoodItemAggById;

const { HttpServerError } = require("common");

let { FoodItem } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getFoodItemById = async (foodItemId) => {
  try {
    const foodItem = Array.isArray(foodItemId)
      ? await FoodItem.findAll({
          where: {
            id: { [Op.in]: foodItemId },
            isActive: true,
          },
        })
      : await FoodItem.findOne({
          where: {
            id: foodItemId,
            isActive: true,
          },
        });

    if (!foodItem) {
      return null;
    }
    return Array.isArray(foodItemId)
      ? foodItem.map((item) => item.getData())
      : foodItem.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenRequestingFoodItemById", err);
  }
};

module.exports = getFoodItemById;

const { HttpServerError } = require("common");

let { Dish } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getDishById = async (dishId) => {
  try {
    const dish = Array.isArray(dishId)
      ? await Dish.findAll({
          where: {
            id: { [Op.in]: dishId },
            isActive: true,
          },
        })
      : await Dish.findOne({
          where: {
            id: dishId,
            isActive: true,
          },
        });

    if (!dish) {
      return null;
    }
    return Array.isArray(dishId)
      ? dish.map((item) => item.getData())
      : dish.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenRequestingDishById", err);
  }
};

module.exports = getDishById;

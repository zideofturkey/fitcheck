const { HttpServerError } = require("common");

let { DishLine } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getDishLineById = async (dishLineId) => {
  try {
    const dishLine = Array.isArray(dishLineId)
      ? await DishLine.findAll({
          where: {
            id: { [Op.in]: dishLineId },
            isActive: true,
          },
        })
      : await DishLine.findOne({
          where: {
            id: dishLineId,
            isActive: true,
          },
        });

    if (!dishLine) {
      return null;
    }
    return Array.isArray(dishLineId)
      ? dishLine.map((item) => item.getData())
      : dishLine.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishLineById",
      err,
    );
  }
};

module.exports = getDishLineById;

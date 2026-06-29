const { HttpServerError } = require("common");

let { MealLine } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getMealLineById = async (mealLineId) => {
  try {
    const mealLine = Array.isArray(mealLineId)
      ? await MealLine.findAll({
          where: {
            id: { [Op.in]: mealLineId },
          },
        })
      : await MealLine.findByPk(mealLineId);

    if (!mealLine) {
      return null;
    }
    return Array.isArray(mealLineId)
      ? mealLine.map((item) => item.getData())
      : mealLine.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenRequestingMealLineById", err);
  }
};

module.exports = getMealLineById;

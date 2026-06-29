const { HttpServerError } = require("common");

let { MealLog } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getMealLogById = async (mealLogId) => {
  try {
    const mealLog = Array.isArray(mealLogId)
      ? await MealLog.findAll({
          where: {
            id: { [Op.in]: mealLogId },
          },
        })
      : await MealLog.findByPk(mealLogId);

    if (!mealLog) {
      return null;
    }
    return Array.isArray(mealLogId)
      ? mealLog.map((item) => item.getData())
      : mealLog.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenRequestingMealLogById", err);
  }
};

module.exports = getMealLogById;

const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MealLog, MealLine, NutritionDay } = require("models");
const { Op } = require("sequelize");

const getMealLogAggById = async (mealLogId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const mealLog = Array.isArray(mealLogId)
      ? await MealLog.findAll({
          where: {
            id: { [Op.in]: mealLogId },
          },
          include: includes,
        })
      : await MealLog.findByPk(mealLogId, { include: includes });

    if (!mealLog) {
      return null;
    }

    const mealLogData =
      Array.isArray(mealLogId) && mealLogId.length > 0
        ? mealLog.map((item) => item.getData())
        : mealLog.getData();
    await MealLog.getCqrsJoins(mealLogData);
    return mealLogData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLogAggById",
      err,
    );
  }
};

module.exports = getMealLogAggById;

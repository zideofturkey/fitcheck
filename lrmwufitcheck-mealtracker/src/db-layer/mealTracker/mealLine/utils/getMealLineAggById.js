const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MealLog, MealLine, NutritionDay } = require("models");
const { Op } = require("sequelize");

const getMealLineAggById = async (mealLineId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const mealLine = Array.isArray(mealLineId)
      ? await MealLine.findAll({
          where: {
            id: { [Op.in]: mealLineId },
          },
          include: includes,
        })
      : await MealLine.findByPk(mealLineId, { include: includes });

    if (!mealLine) {
      return null;
    }

    const mealLineData =
      Array.isArray(mealLineId) && mealLineId.length > 0
        ? mealLine.map((item) => item.getData())
        : mealLine.getData();
    await MealLine.getCqrsJoins(mealLineData);
    return mealLineData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLineAggById",
      err,
    );
  }
};

module.exports = getMealLineAggById;

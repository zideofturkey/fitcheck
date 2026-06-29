const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MealLog, MealLine, NutritionDay } = require("models");
const { Op } = require("sequelize");

const getNutritionDayAggById = async (nutritionDayId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const nutritionDay = Array.isArray(nutritionDayId)
      ? await NutritionDay.findAll({
          where: {
            id: { [Op.in]: nutritionDayId },
          },
          include: includes,
        })
      : await NutritionDay.findByPk(nutritionDayId, { include: includes });

    if (!nutritionDay) {
      return null;
    }

    const nutritionDayData =
      Array.isArray(nutritionDayId) && nutritionDayId.length > 0
        ? nutritionDay.map((item) => item.getData())
        : nutritionDay.getData();
    await NutritionDay.getCqrsJoins(nutritionDayData);
    return nutritionDayData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayAggById",
      err,
    );
  }
};

module.exports = getNutritionDayAggById;

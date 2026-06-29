const { HttpServerError, BadRequestError } = require("common");

const { NutritionDay } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getNutritionDayListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getNutritionDayListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const nutritionDay = await NutritionDay.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!nutritionDay || nutritionDay.length === 0) return [];

    return nutritionDay.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayListByQuery",
      err,
    );
  }
};

module.exports = getNutritionDayListByQuery;

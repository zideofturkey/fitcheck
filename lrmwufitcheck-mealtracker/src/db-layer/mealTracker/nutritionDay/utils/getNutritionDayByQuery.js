const { HttpServerError, BadRequestError } = require("common");

const { NutritionDay } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getNutritionDayByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getNutritionDayByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const nutritionDay = await NutritionDay.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!nutritionDay) return null;
    return nutritionDay.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingNutritionDayByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayByQuery",
      err,
    );
  }
};

module.exports = getNutritionDayByQuery;

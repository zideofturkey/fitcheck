const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { NutritionDay } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single NutritionDay matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getNutritionDayByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const nutritionDay = await NutritionDay.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!nutritionDay) return null;
    return nutritionDay.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingNutritionDayByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayByMQuery",
      err,
    );
  }
};

module.exports = getNutritionDayByMQuery;

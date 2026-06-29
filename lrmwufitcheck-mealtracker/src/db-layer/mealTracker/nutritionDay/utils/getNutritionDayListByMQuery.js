const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { NutritionDay } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple NutritionDay records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getNutritionDayListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const nutritionDay = await NutritionDay.findAll({
      where: query,
    });

    if (!nutritionDay || nutritionDay.length === 0) return [];

    return nutritionDay.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayListByMQuery",
      err,
    );
  }
};

module.exports = getNutritionDayListByMQuery;

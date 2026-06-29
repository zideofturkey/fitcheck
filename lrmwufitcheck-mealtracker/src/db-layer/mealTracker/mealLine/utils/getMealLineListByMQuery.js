const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { MealLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple MealLine records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getMealLineListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const mealLine = await MealLine.findAll({
      where: query,
    });

    if (!mealLine || mealLine.length === 0) return [];

    return mealLine.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLineListByMQuery",
      err,
    );
  }
};

module.exports = getMealLineListByMQuery;

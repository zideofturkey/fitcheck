const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { MealLog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple MealLog records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getMealLogListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const mealLog = await MealLog.findAll({
      where: query,
    });

    if (!mealLog || mealLog.length === 0) return [];

    return mealLog.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLogListByMQuery",
      err,
    );
  }
};

module.exports = getMealLogListByMQuery;

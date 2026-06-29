const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { MealLog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single MealLog matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getMealLogByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const mealLog = await MealLog.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!mealLog) return null;
    return mealLog.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingMealLogByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLogByMQuery",
      err,
    );
  }
};

module.exports = getMealLogByMQuery;

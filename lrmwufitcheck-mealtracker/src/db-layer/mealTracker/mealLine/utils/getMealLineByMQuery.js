const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { MealLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single MealLine matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getMealLineByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const mealLine = await MealLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!mealLine) return null;
    return mealLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingMealLineByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLineByMQuery",
      err,
    );
  }
};

module.exports = getMealLineByMQuery;

const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { FoodItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single FoodItem matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getFoodItemByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    // Default soft-delete filter only when the caller did not explicitly set isActive
    const whereClause = Object.prototype.hasOwnProperty.call(query, "isActive")
      ? query
      : { [Op.and]: [query, { isActive: true }] };

    const foodItem = await FoodItem.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!foodItem) return null;
    return foodItem.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingFoodItemByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFoodItemByMQuery",
      err,
    );
  }
};

module.exports = getFoodItemByMQuery;

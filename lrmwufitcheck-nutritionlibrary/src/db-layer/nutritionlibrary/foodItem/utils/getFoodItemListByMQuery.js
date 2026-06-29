const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { FoodItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple FoodItem records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getFoodItemListByMQuery = async (mQuery) => {
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
      : { ...query, isActive: true };
    const foodItem = await FoodItem.findAll({
      where: whereClause,
    });

    if (!foodItem || foodItem.length === 0) return [];

    return foodItem.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFoodItemListByMQuery",
      err,
    );
  }
};

module.exports = getFoodItemListByMQuery;

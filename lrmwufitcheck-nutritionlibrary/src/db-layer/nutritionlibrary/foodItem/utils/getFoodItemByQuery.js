const { HttpServerError, BadRequestError } = require("common");

const { FoodItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getFoodItemByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getFoodItemByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

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
    console.log("errMsg_dbErrorWhenRequestingFoodItemByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFoodItemByQuery",
      err,
    );
  }
};

module.exports = getFoodItemByQuery;

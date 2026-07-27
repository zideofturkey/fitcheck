const { HttpServerError, BadRequestError } = require("common");

const { Dish } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getDishListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getDishListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    // Default soft-delete filter only when the caller did not explicitly set isActive
    const whereClause = Object.prototype.hasOwnProperty.call(query, "isActive")
      ? query
      : { ...query, isActive: true };
    const dish = await Dish.findAll({
      where: whereClause,
    });

    //should i add not found error or only return empty array?
    if (!dish || dish.length === 0) return [];

    return dish.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishListByQuery",
      err,
    );
  }
};

module.exports = getDishListByQuery;

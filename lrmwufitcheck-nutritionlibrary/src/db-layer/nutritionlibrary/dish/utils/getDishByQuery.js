const { HttpServerError, BadRequestError } = require("common");

const { Dish } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getDishByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getDishByQuery = async (query) => {
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

    const dish = await Dish.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!dish) return null;
    return dish.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingDishByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishByQuery",
      err,
    );
  }
};

module.exports = getDishByQuery;

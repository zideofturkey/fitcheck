const { HttpServerError, BadRequestError } = require("common");

const { DishLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getDishLineByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getDishLineByQuery = async (query) => {
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

    const dishLine = await DishLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!dishLine) return null;
    return dishLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingDishLineByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishLineByQuery",
      err,
    );
  }
};

module.exports = getDishLineByQuery;

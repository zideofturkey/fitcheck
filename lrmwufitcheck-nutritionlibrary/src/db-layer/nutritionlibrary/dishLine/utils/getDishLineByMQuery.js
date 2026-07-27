const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { DishLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single DishLine matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getDishLineByMQuery = async (mQuery) => {
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

    const dishLine = await DishLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!dishLine) return null;
    return dishLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingDishLineByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishLineByMQuery",
      err,
    );
  }
};

module.exports = getDishLineByMQuery;

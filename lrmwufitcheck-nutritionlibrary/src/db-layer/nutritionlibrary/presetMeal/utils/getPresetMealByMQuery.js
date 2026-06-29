const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { PresetMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single PresetMeal matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getPresetMealByMQuery = async (mQuery) => {
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

    const presetMeal = await PresetMeal.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!presetMeal) return null;
    return presetMeal.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingPresetMealByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetMealByMQuery",
      err,
    );
  }
};

module.exports = getPresetMealByMQuery;

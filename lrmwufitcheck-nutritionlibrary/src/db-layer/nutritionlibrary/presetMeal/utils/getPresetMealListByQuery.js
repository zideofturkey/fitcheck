const { HttpServerError, BadRequestError } = require("common");

const { PresetMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getPresetMealListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getPresetMealListByQuery = async (query) => {
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
    const presetMeal = await PresetMeal.findAll({
      where: whereClause,
    });

    //should i add not found error or only return empty array?
    if (!presetMeal || presetMeal.length === 0) return [];

    return presetMeal.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetMealListByQuery",
      err,
    );
  }
};

module.exports = getPresetMealListByQuery;

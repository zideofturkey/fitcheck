const { HttpServerError, BadRequestError } = require("common");

const { PresetMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getPresetMealByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getPresetMealByQuery = async (query) => {
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

    const presetMeal = await PresetMeal.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!presetMeal) return null;
    return presetMeal.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingPresetMealByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetMealByQuery",
      err,
    );
  }
};

module.exports = getPresetMealByQuery;

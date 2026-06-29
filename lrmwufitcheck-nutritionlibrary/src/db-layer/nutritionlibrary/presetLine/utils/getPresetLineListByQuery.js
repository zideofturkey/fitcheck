const { HttpServerError, BadRequestError } = require("common");

const { PresetLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getPresetLineListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getPresetLineListByQuery = async (query) => {
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
    const presetLine = await PresetLine.findAll({
      where: whereClause,
    });

    //should i add not found error or only return empty array?
    if (!presetLine || presetLine.length === 0) return [];

    return presetLine.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetLineListByQuery",
      err,
    );
  }
};

module.exports = getPresetLineListByQuery;

const { HttpServerError, BadRequestError } = require("common");

const { PresetLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getPresetLineByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getPresetLineByQuery = async (query) => {
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

    const presetLine = await PresetLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!presetLine) return null;
    return presetLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingPresetLineByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetLineByQuery",
      err,
    );
  }
};

module.exports = getPresetLineByQuery;

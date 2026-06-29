const { HttpServerError, BadRequestError } = require("common");

const { MacroTarget } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getMacroTargetByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getMacroTargetByQuery = async (query) => {
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

    const macroTarget = await MacroTarget.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!macroTarget) return null;
    return macroTarget.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingMacroTargetByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMacroTargetByQuery",
      err,
    );
  }
};

module.exports = getMacroTargetByQuery;

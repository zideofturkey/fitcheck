const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { MacroTarget } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple MacroTarget records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getMacroTargetListByMQuery = async (mQuery) => {
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
      : { ...query, isActive: true };
    const macroTarget = await MacroTarget.findAll({
      where: whereClause,
    });

    if (!macroTarget || macroTarget.length === 0) return [];

    return macroTarget.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMacroTargetListByMQuery",
      err,
    );
  }
};

module.exports = getMacroTargetListByMQuery;

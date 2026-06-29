const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { Sys_agentOverride } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple Sys_agentOverride records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getSys_agentOverrideListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const sys_agentOverride = await Sys_agentOverride.findAll({
      where: query,
    });

    if (!sys_agentOverride || sys_agentOverride.length === 0) return [];

    return sys_agentOverride.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideListByMQuery",
      err,
    );
  }
};

module.exports = getSys_agentOverrideListByMQuery;

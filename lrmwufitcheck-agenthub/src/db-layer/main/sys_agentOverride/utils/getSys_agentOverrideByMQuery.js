const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { Sys_agentOverride } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single Sys_agentOverride matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getSys_agentOverrideByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const sys_agentOverride = await Sys_agentOverride.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_agentOverride) return null;
    return sys_agentOverride.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingSys_agentOverrideByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideByMQuery",
      err,
    );
  }
};

module.exports = getSys_agentOverrideByMQuery;

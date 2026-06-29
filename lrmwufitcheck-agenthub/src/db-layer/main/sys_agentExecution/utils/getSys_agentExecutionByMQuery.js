const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { Sys_agentExecution } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single Sys_agentExecution matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getSys_agentExecutionByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const sys_agentExecution = await Sys_agentExecution.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_agentExecution) return null;
    return sys_agentExecution.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingSys_agentExecutionByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionByMQuery",
      err,
    );
  }
};

module.exports = getSys_agentExecutionByMQuery;

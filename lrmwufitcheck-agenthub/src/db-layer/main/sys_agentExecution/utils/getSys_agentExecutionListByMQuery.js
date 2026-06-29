const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { Sys_agentExecution } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple Sys_agentExecution records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getSys_agentExecutionListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const sys_agentExecution = await Sys_agentExecution.findAll({
      where: query,
    });

    if (!sys_agentExecution || sys_agentExecution.length === 0) return [];

    return sys_agentExecution.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionListByMQuery",
      err,
    );
  }
};

module.exports = getSys_agentExecutionListByMQuery;

const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentExecution } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentExecutionListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentExecutionListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const sys_agentExecution = await Sys_agentExecution.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!sys_agentExecution || sys_agentExecution.length === 0) return [];

    return sys_agentExecution.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionListByQuery",
      err,
    );
  }
};

module.exports = getSys_agentExecutionListByQuery;

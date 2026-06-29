const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentExecution } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentExecutionByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentExecutionByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const sys_agentExecution = await Sys_agentExecution.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_agentExecution) return null;
    return sys_agentExecution.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingSys_agentExecutionByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionByQuery",
      err,
    );
  }
};

module.exports = getSys_agentExecutionByQuery;

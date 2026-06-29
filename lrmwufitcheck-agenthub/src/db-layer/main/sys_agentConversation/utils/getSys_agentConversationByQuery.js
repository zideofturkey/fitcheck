const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentConversationByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentConversationByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const sys_agentConversation = await Sys_agentConversation.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_agentConversation) return null;
    return sys_agentConversation.getData();
  } catch (err) {
    console.log(
      "errMsg_dbErrorWhenRequestingSys_agentConversationByQuery",
      err,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationByQuery",
      err,
    );
  }
};

module.exports = getSys_agentConversationByQuery;

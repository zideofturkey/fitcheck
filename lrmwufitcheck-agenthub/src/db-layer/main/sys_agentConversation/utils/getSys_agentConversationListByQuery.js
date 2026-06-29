const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentConversationListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentConversationListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const sys_agentConversation = await Sys_agentConversation.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!sys_agentConversation || sys_agentConversation.length === 0) return [];

    return sys_agentConversation.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationListByQuery",
      err,
    );
  }
};

module.exports = getSys_agentConversationListByQuery;

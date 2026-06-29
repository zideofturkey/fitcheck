const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple Sys_agentConversation records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getSys_agentConversationListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const sys_agentConversation = await Sys_agentConversation.findAll({
      where: query,
    });

    if (!sys_agentConversation || sys_agentConversation.length === 0) return [];

    return sys_agentConversation.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationListByMQuery",
      err,
    );
  }
};

module.exports = getSys_agentConversationListByMQuery;

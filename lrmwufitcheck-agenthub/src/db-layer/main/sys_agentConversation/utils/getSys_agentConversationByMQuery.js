const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single Sys_agentConversation matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getSys_agentConversationByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const sys_agentConversation = await Sys_agentConversation.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_agentConversation) return null;
    return sys_agentConversation.getData();
  } catch (err) {
    console.log(
      "errMsg_dbErrorWhenRequestingSys_agentConversationByMQuery",
      err,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationByMQuery",
      err,
    );
  }
};

module.exports = getSys_agentConversationByMQuery;

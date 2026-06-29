const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  Sys_agentOverride,
  Sys_agentExecution,
  Sys_toolCatalog,
  Sys_agentConversation,
} = require("models");
const { Op } = require("sequelize");

const getSys_agentConversationAggById = async (sys_agentConversationId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const sys_agentConversation = Array.isArray(sys_agentConversationId)
      ? await Sys_agentConversation.findAll({
          where: {
            id: { [Op.in]: sys_agentConversationId },
          },
          include: includes,
        })
      : await Sys_agentConversation.findByPk(sys_agentConversationId, {
          include: includes,
        });

    if (!sys_agentConversation) {
      return null;
    }

    const sys_agentConversationData =
      Array.isArray(sys_agentConversationId) &&
      sys_agentConversationId.length > 0
        ? sys_agentConversation.map((item) => item.getData())
        : sys_agentConversation.getData();
    await Sys_agentConversation.getCqrsJoins(sys_agentConversationData);
    return sys_agentConversationData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationAggById",
      err,
    );
  }
};

module.exports = getSys_agentConversationAggById;

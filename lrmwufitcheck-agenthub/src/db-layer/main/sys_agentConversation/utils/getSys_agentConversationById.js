const { HttpServerError } = require("common");

let { Sys_agentConversation } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getSys_agentConversationById = async (sys_agentConversationId) => {
  try {
    const sys_agentConversation = Array.isArray(sys_agentConversationId)
      ? await Sys_agentConversation.findAll({
          where: {
            id: { [Op.in]: sys_agentConversationId },
          },
        })
      : await Sys_agentConversation.findByPk(sys_agentConversationId);

    if (!sys_agentConversation) {
      return null;
    }
    return Array.isArray(sys_agentConversationId)
      ? sys_agentConversation.map((item) => item.getData())
      : sys_agentConversation.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationById",
      err,
    );
  }
};

module.exports = getSys_agentConversationById;

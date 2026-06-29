const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");

const getIdListOfSys_agentConversationByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let sys_agentConversationIdList =
      await Sys_agentConversation.findAll(options);

    if (!sys_agentConversationIdList) {
      throw new NotFoundError(
        `Sys_agentConversation with the specified criteria not found`,
      );
    }

    sys_agentConversationIdList = sys_agentConversationIdList.map(
      (item) => item.id,
    );
    return sys_agentConversationIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentConversationIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfSys_agentConversationByField;

const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  Sys_agentOverride,
  Sys_agentExecution,
  Sys_toolCatalog,
  Sys_agentConversation,
} = require("models");
const { Op } = require("sequelize");

const getSys_agentExecutionAggById = async (sys_agentExecutionId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const sys_agentExecution = Array.isArray(sys_agentExecutionId)
      ? await Sys_agentExecution.findAll({
          where: {
            id: { [Op.in]: sys_agentExecutionId },
          },
          include: includes,
        })
      : await Sys_agentExecution.findByPk(sys_agentExecutionId, {
          include: includes,
        });

    if (!sys_agentExecution) {
      return null;
    }

    const sys_agentExecutionData =
      Array.isArray(sys_agentExecutionId) && sys_agentExecutionId.length > 0
        ? sys_agentExecution.map((item) => item.getData())
        : sys_agentExecution.getData();
    await Sys_agentExecution.getCqrsJoins(sys_agentExecutionData);
    return sys_agentExecutionData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionAggById",
      err,
    );
  }
};

module.exports = getSys_agentExecutionAggById;

const { HttpServerError } = require("common");

let { Sys_agentExecution } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getSys_agentExecutionById = async (sys_agentExecutionId) => {
  try {
    const sys_agentExecution = Array.isArray(sys_agentExecutionId)
      ? await Sys_agentExecution.findAll({
          where: {
            id: { [Op.in]: sys_agentExecutionId },
          },
        })
      : await Sys_agentExecution.findByPk(sys_agentExecutionId);

    if (!sys_agentExecution) {
      return null;
    }
    return Array.isArray(sys_agentExecutionId)
      ? sys_agentExecution.map((item) => item.getData())
      : sys_agentExecution.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionById",
      err,
    );
  }
};

module.exports = getSys_agentExecutionById;

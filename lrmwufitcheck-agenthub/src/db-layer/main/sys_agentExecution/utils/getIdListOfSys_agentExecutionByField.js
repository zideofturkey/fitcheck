const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Sys_agentExecution } = require("models");
const { Op } = require("sequelize");

const getIdListOfSys_agentExecutionByField = async (
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

    let sys_agentExecutionIdList = await Sys_agentExecution.findAll(options);

    if (!sys_agentExecutionIdList) {
      throw new NotFoundError(
        `Sys_agentExecution with the specified criteria not found`,
      );
    }

    sys_agentExecutionIdList = sys_agentExecutionIdList.map((item) => item.id);
    return sys_agentExecutionIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentExecutionIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfSys_agentExecutionByField;

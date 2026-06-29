const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Sys_agentOverride } = require("models");
const { Op } = require("sequelize");

const getIdListOfSys_agentOverrideByField = async (
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

    let sys_agentOverrideIdList = await Sys_agentOverride.findAll(options);

    if (!sys_agentOverrideIdList) {
      throw new NotFoundError(
        `Sys_agentOverride with the specified criteria not found`,
      );
    }

    sys_agentOverrideIdList = sys_agentOverrideIdList.map((item) => item.id);
    return sys_agentOverrideIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfSys_agentOverrideByField;

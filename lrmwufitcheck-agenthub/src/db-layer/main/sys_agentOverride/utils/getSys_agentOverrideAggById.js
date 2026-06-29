const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  Sys_agentOverride,
  Sys_agentExecution,
  Sys_toolCatalog,
  Sys_agentConversation,
} = require("models");
const { Op } = require("sequelize");

const getSys_agentOverrideAggById = async (sys_agentOverrideId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const sys_agentOverride = Array.isArray(sys_agentOverrideId)
      ? await Sys_agentOverride.findAll({
          where: {
            id: { [Op.in]: sys_agentOverrideId },
          },
          include: includes,
        })
      : await Sys_agentOverride.findByPk(sys_agentOverrideId, {
          include: includes,
        });

    if (!sys_agentOverride) {
      return null;
    }

    const sys_agentOverrideData =
      Array.isArray(sys_agentOverrideId) && sys_agentOverrideId.length > 0
        ? sys_agentOverride.map((item) => item.getData())
        : sys_agentOverride.getData();
    await Sys_agentOverride.getCqrsJoins(sys_agentOverrideData);
    return sys_agentOverrideData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideAggById",
      err,
    );
  }
};

module.exports = getSys_agentOverrideAggById;

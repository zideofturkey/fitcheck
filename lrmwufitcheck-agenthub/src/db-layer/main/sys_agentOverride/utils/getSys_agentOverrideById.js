const { HttpServerError } = require("common");

let { Sys_agentOverride } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getSys_agentOverrideById = async (sys_agentOverrideId) => {
  try {
    const sys_agentOverride = Array.isArray(sys_agentOverrideId)
      ? await Sys_agentOverride.findAll({
          where: {
            id: { [Op.in]: sys_agentOverrideId },
          },
        })
      : await Sys_agentOverride.findByPk(sys_agentOverrideId);

    if (!sys_agentOverride) {
      return null;
    }
    return Array.isArray(sys_agentOverrideId)
      ? sys_agentOverride.map((item) => item.getData())
      : sys_agentOverride.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideById",
      err,
    );
  }
};

module.exports = getSys_agentOverrideById;

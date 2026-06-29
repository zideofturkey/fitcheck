const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentOverride } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentOverrideListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentOverrideListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const sys_agentOverride = await Sys_agentOverride.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!sys_agentOverride || sys_agentOverride.length === 0) return [];

    return sys_agentOverride.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideListByQuery",
      err,
    );
  }
};

module.exports = getSys_agentOverrideListByQuery;

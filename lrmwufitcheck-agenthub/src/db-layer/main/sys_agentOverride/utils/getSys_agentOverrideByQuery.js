const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentOverride } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentOverrideByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentOverrideByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const sys_agentOverride = await Sys_agentOverride.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_agentOverride) return null;
    return sys_agentOverride.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingSys_agentOverrideByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_agentOverrideByQuery",
      err,
    );
  }
};

module.exports = getSys_agentOverrideByQuery;

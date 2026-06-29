const { HttpServerError, BadRequestError } = require("common");

const { AiSession } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiSessionListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiSessionListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const aiSession = await AiSession.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!aiSession || aiSession.length === 0) return [];

    return aiSession.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiSessionListByQuery",
      err,
    );
  }
};

module.exports = getAiSessionListByQuery;

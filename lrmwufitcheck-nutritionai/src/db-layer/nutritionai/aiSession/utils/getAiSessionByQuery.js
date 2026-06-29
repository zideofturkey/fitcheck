const { HttpServerError, BadRequestError } = require("common");

const { AiSession } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiSessionByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiSessionByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const aiSession = await AiSession.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiSession) return null;
    return aiSession.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiSessionByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiSessionByQuery",
      err,
    );
  }
};

module.exports = getAiSessionByQuery;

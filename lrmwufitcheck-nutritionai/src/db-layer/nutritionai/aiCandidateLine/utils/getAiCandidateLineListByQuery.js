const { HttpServerError, BadRequestError } = require("common");

const { AiCandidateLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiCandidateLineListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiCandidateLineListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const aiCandidateLine = await AiCandidateLine.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!aiCandidateLine || aiCandidateLine.length === 0) return [];

    return aiCandidateLine.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineListByQuery",
      err,
    );
  }
};

module.exports = getAiCandidateLineListByQuery;

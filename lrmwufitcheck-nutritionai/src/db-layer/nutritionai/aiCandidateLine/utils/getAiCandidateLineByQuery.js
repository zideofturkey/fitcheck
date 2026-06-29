const { HttpServerError, BadRequestError } = require("common");

const { AiCandidateLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiCandidateLineByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiCandidateLineByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const aiCandidateLine = await AiCandidateLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiCandidateLine) return null;
    return aiCandidateLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiCandidateLineByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineByQuery",
      err,
    );
  }
};

module.exports = getAiCandidateLineByQuery;

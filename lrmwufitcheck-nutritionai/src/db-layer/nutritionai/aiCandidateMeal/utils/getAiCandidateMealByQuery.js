const { HttpServerError, BadRequestError } = require("common");

const { AiCandidateMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiCandidateMealByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiCandidateMealByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const aiCandidateMeal = await AiCandidateMeal.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiCandidateMeal) return null;
    return aiCandidateMeal.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiCandidateMealByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealByQuery",
      err,
    );
  }
};

module.exports = getAiCandidateMealByQuery;

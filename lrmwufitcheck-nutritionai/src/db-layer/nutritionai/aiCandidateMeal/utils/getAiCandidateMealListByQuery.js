const { HttpServerError, BadRequestError } = require("common");

const { AiCandidateMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiCandidateMealListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiCandidateMealListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const aiCandidateMeal = await AiCandidateMeal.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!aiCandidateMeal || aiCandidateMeal.length === 0) return [];

    return aiCandidateMeal.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealListByQuery",
      err,
    );
  }
};

module.exports = getAiCandidateMealListByQuery;

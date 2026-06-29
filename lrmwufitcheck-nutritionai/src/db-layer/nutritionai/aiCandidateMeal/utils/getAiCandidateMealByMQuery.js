const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { AiCandidateMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single AiCandidateMeal matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getAiCandidateMealByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const aiCandidateMeal = await AiCandidateMeal.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiCandidateMeal) return null;
    return aiCandidateMeal.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiCandidateMealByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealByMQuery",
      err,
    );
  }
};

module.exports = getAiCandidateMealByMQuery;

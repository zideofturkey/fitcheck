const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { AiCandidateLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single AiCandidateLine matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getAiCandidateLineByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const aiCandidateLine = await AiCandidateLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiCandidateLine) return null;
    return aiCandidateLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiCandidateLineByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineByMQuery",
      err,
    );
  }
};

module.exports = getAiCandidateLineByMQuery;

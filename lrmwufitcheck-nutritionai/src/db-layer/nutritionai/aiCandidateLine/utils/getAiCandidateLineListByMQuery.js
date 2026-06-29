const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { AiCandidateLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple AiCandidateLine records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getAiCandidateLineListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const aiCandidateLine = await AiCandidateLine.findAll({
      where: query,
    });

    if (!aiCandidateLine || aiCandidateLine.length === 0) return [];

    return aiCandidateLine.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineListByMQuery",
      err,
    );
  }
};

module.exports = getAiCandidateLineListByMQuery;

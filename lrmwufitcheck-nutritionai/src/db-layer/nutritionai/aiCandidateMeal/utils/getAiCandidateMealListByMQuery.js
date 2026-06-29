const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { AiCandidateMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple AiCandidateMeal records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getAiCandidateMealListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const aiCandidateMeal = await AiCandidateMeal.findAll({
      where: query,
    });

    if (!aiCandidateMeal || aiCandidateMeal.length === 0) return [];

    return aiCandidateMeal.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealListByMQuery",
      err,
    );
  }
};

module.exports = getAiCandidateMealListByMQuery;

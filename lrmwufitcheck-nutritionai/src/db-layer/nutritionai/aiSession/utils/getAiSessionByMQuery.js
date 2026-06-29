const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { AiSession } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single AiSession matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getAiSessionByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const aiSession = await AiSession.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiSession) return null;
    return aiSession.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiSessionByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiSessionByMQuery",
      err,
    );
  }
};

module.exports = getAiSessionByMQuery;

const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { AiSession } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple AiSession records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getAiSessionListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const aiSession = await AiSession.findAll({
      where: query,
    });

    if (!aiSession || aiSession.length === 0) return [];

    return aiSession.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiSessionListByMQuery",
      err,
    );
  }
};

module.exports = getAiSessionListByMQuery;

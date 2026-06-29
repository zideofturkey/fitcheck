const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { AiGuidanceNote } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single AiGuidanceNote matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getAiGuidanceNoteByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const aiGuidanceNote = await AiGuidanceNote.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiGuidanceNote) return null;
    return aiGuidanceNote.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiGuidanceNoteByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteByMQuery",
      err,
    );
  }
};

module.exports = getAiGuidanceNoteByMQuery;

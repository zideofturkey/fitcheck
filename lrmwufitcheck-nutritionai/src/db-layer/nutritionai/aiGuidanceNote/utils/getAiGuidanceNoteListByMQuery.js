const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { AiGuidanceNote } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple AiGuidanceNote records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getAiGuidanceNoteListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const aiGuidanceNote = await AiGuidanceNote.findAll({
      where: query,
    });

    if (!aiGuidanceNote || aiGuidanceNote.length === 0) return [];

    return aiGuidanceNote.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteListByMQuery",
      err,
    );
  }
};

module.exports = getAiGuidanceNoteListByMQuery;

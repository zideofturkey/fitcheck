const { HttpServerError, BadRequestError } = require("common");

const { AiGuidanceNote } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiGuidanceNoteListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiGuidanceNoteListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const aiGuidanceNote = await AiGuidanceNote.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!aiGuidanceNote || aiGuidanceNote.length === 0) return [];

    return aiGuidanceNote.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteListByQuery",
      err,
    );
  }
};

module.exports = getAiGuidanceNoteListByQuery;

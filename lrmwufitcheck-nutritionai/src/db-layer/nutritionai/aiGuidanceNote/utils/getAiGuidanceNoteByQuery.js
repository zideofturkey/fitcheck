const { HttpServerError, BadRequestError } = require("common");

const { AiGuidanceNote } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getAiGuidanceNoteByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getAiGuidanceNoteByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const aiGuidanceNote = await AiGuidanceNote.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!aiGuidanceNote) return null;
    return aiGuidanceNote.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingAiGuidanceNoteByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteByQuery",
      err,
    );
  }
};

module.exports = getAiGuidanceNoteByQuery;

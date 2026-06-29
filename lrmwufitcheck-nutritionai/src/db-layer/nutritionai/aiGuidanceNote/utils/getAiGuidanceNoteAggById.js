const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  AiSession,
  AiCandidateMeal,
  AiCandidateLine,
  AiGuidanceNote,
} = require("models");
const { Op } = require("sequelize");

const getAiGuidanceNoteAggById = async (aiGuidanceNoteId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const aiGuidanceNote = Array.isArray(aiGuidanceNoteId)
      ? await AiGuidanceNote.findAll({
          where: {
            id: { [Op.in]: aiGuidanceNoteId },
          },
          include: includes,
        })
      : await AiGuidanceNote.findByPk(aiGuidanceNoteId, { include: includes });

    if (!aiGuidanceNote) {
      return null;
    }

    const aiGuidanceNoteData =
      Array.isArray(aiGuidanceNoteId) && aiGuidanceNoteId.length > 0
        ? aiGuidanceNote.map((item) => item.getData())
        : aiGuidanceNote.getData();
    await AiGuidanceNote.getCqrsJoins(aiGuidanceNoteData);
    return aiGuidanceNoteData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteAggById",
      err,
    );
  }
};

module.exports = getAiGuidanceNoteAggById;

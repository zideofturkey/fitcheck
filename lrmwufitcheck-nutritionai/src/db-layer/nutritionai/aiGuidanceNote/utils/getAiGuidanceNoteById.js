const { HttpServerError } = require("common");

let { AiGuidanceNote } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getAiGuidanceNoteById = async (aiGuidanceNoteId) => {
  try {
    const aiGuidanceNote = Array.isArray(aiGuidanceNoteId)
      ? await AiGuidanceNote.findAll({
          where: {
            id: { [Op.in]: aiGuidanceNoteId },
          },
        })
      : await AiGuidanceNote.findByPk(aiGuidanceNoteId);

    if (!aiGuidanceNote) {
      return null;
    }
    return Array.isArray(aiGuidanceNoteId)
      ? aiGuidanceNote.map((item) => item.getData())
      : aiGuidanceNote.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteById",
      err,
    );
  }
};

module.exports = getAiGuidanceNoteById;

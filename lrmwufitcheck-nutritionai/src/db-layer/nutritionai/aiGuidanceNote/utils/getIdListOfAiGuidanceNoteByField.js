const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { AiGuidanceNote } = require("models");
const { Op } = require("sequelize");

const getIdListOfAiGuidanceNoteByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let aiGuidanceNoteIdList = await AiGuidanceNote.findAll(options);

    if (!aiGuidanceNoteIdList) {
      throw new NotFoundError(
        `AiGuidanceNote with the specified criteria not found`,
      );
    }

    aiGuidanceNoteIdList = aiGuidanceNoteIdList.map((item) => item.id);
    return aiGuidanceNoteIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiGuidanceNoteIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfAiGuidanceNoteByField;

const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { AiCandidateLine } = require("models");
const { Op } = require("sequelize");

const getIdListOfAiCandidateLineByField = async (
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

    let aiCandidateLineIdList = await AiCandidateLine.findAll(options);

    if (!aiCandidateLineIdList) {
      throw new NotFoundError(
        `AiCandidateLine with the specified criteria not found`,
      );
    }

    aiCandidateLineIdList = aiCandidateLineIdList.map((item) => item.id);
    return aiCandidateLineIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfAiCandidateLineByField;

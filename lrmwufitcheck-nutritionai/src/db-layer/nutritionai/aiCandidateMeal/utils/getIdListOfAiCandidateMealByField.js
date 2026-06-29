const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { AiCandidateMeal } = require("models");
const { Op } = require("sequelize");

const getIdListOfAiCandidateMealByField = async (
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

    let aiCandidateMealIdList = await AiCandidateMeal.findAll(options);

    if (!aiCandidateMealIdList) {
      throw new NotFoundError(
        `AiCandidateMeal with the specified criteria not found`,
      );
    }

    aiCandidateMealIdList = aiCandidateMealIdList.map((item) => item.id);
    return aiCandidateMealIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfAiCandidateMealByField;

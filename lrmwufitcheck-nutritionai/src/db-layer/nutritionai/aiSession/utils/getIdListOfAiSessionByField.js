const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { AiSession } = require("models");
const { Op } = require("sequelize");

const getIdListOfAiSessionByField = async (fieldName, fieldValue, isArray) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let aiSessionIdList = await AiSession.findAll(options);

    if (!aiSessionIdList) {
      throw new NotFoundError(
        `AiSession with the specified criteria not found`,
      );
    }

    aiSessionIdList = aiSessionIdList.map((item) => item.id);
    return aiSessionIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiSessionIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfAiSessionByField;

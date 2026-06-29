const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  AiSession,
  AiCandidateMeal,
  AiCandidateLine,
  AiGuidanceNote,
} = require("models");
const { Op } = require("sequelize");

const getAiSessionAggById = async (aiSessionId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const aiSession = Array.isArray(aiSessionId)
      ? await AiSession.findAll({
          where: {
            id: { [Op.in]: aiSessionId },
          },
          include: includes,
        })
      : await AiSession.findByPk(aiSessionId, { include: includes });

    if (!aiSession) {
      return null;
    }

    const aiSessionData =
      Array.isArray(aiSessionId) && aiSessionId.length > 0
        ? aiSession.map((item) => item.getData())
        : aiSession.getData();
    await AiSession.getCqrsJoins(aiSessionData);
    return aiSessionData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiSessionAggById",
      err,
    );
  }
};

module.exports = getAiSessionAggById;

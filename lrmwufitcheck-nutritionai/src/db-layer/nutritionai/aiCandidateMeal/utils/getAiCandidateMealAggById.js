const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  AiSession,
  AiCandidateMeal,
  AiCandidateLine,
  AiGuidanceNote,
} = require("models");
const { Op } = require("sequelize");

const getAiCandidateMealAggById = async (aiCandidateMealId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const aiCandidateMeal = Array.isArray(aiCandidateMealId)
      ? await AiCandidateMeal.findAll({
          where: {
            id: { [Op.in]: aiCandidateMealId },
          },
          include: includes,
        })
      : await AiCandidateMeal.findByPk(aiCandidateMealId, {
          include: includes,
        });

    if (!aiCandidateMeal) {
      return null;
    }

    const aiCandidateMealData =
      Array.isArray(aiCandidateMealId) && aiCandidateMealId.length > 0
        ? aiCandidateMeal.map((item) => item.getData())
        : aiCandidateMeal.getData();
    await AiCandidateMeal.getCqrsJoins(aiCandidateMealData);
    return aiCandidateMealData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealAggById",
      err,
    );
  }
};

module.exports = getAiCandidateMealAggById;

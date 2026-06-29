const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  AiSession,
  AiCandidateMeal,
  AiCandidateLine,
  AiGuidanceNote,
} = require("models");
const { Op } = require("sequelize");

const getAiCandidateLineAggById = async (aiCandidateLineId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const aiCandidateLine = Array.isArray(aiCandidateLineId)
      ? await AiCandidateLine.findAll({
          where: {
            id: { [Op.in]: aiCandidateLineId },
          },
          include: includes,
        })
      : await AiCandidateLine.findByPk(aiCandidateLineId, {
          include: includes,
        });

    if (!aiCandidateLine) {
      return null;
    }

    const aiCandidateLineData =
      Array.isArray(aiCandidateLineId) && aiCandidateLineId.length > 0
        ? aiCandidateLine.map((item) => item.getData())
        : aiCandidateLine.getData();
    await AiCandidateLine.getCqrsJoins(aiCandidateLineData);
    return aiCandidateLineData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineAggById",
      err,
    );
  }
};

module.exports = getAiCandidateLineAggById;

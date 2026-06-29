const { HttpServerError } = require("common");

let { AiCandidateLine } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getAiCandidateLineById = async (aiCandidateLineId) => {
  try {
    const aiCandidateLine = Array.isArray(aiCandidateLineId)
      ? await AiCandidateLine.findAll({
          where: {
            id: { [Op.in]: aiCandidateLineId },
          },
        })
      : await AiCandidateLine.findByPk(aiCandidateLineId);

    if (!aiCandidateLine) {
      return null;
    }
    return Array.isArray(aiCandidateLineId)
      ? aiCandidateLine.map((item) => item.getData())
      : aiCandidateLine.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateLineById",
      err,
    );
  }
};

module.exports = getAiCandidateLineById;

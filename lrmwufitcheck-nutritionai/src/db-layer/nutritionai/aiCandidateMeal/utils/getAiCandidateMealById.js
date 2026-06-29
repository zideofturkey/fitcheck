const { HttpServerError } = require("common");

let { AiCandidateMeal } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getAiCandidateMealById = async (aiCandidateMealId) => {
  try {
    const aiCandidateMeal = Array.isArray(aiCandidateMealId)
      ? await AiCandidateMeal.findAll({
          where: {
            id: { [Op.in]: aiCandidateMealId },
          },
        })
      : await AiCandidateMeal.findByPk(aiCandidateMealId);

    if (!aiCandidateMeal) {
      return null;
    }
    return Array.isArray(aiCandidateMealId)
      ? aiCandidateMeal.map((item) => item.getData())
      : aiCandidateMeal.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAiCandidateMealById",
      err,
    );
  }
};

module.exports = getAiCandidateMealById;

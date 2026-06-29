const { HttpServerError } = require("common");

let { AiSession } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getAiSessionById = async (aiSessionId) => {
  try {
    const aiSession = Array.isArray(aiSessionId)
      ? await AiSession.findAll({
          where: {
            id: { [Op.in]: aiSessionId },
          },
        })
      : await AiSession.findByPk(aiSessionId);

    if (!aiSession) {
      return null;
    }
    return Array.isArray(aiSessionId)
      ? aiSession.map((item) => item.getData())
      : aiSession.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenRequestingAiSessionById", err);
  }
};

module.exports = getAiSessionById;

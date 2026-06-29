const { HttpServerError } = require("common");

let { MacroTarget } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getMacroTargetById = async (macroTargetId) => {
  try {
    const macroTarget = Array.isArray(macroTargetId)
      ? await MacroTarget.findAll({
          where: {
            id: { [Op.in]: macroTargetId },
            isActive: true,
          },
        })
      : await MacroTarget.findOne({
          where: {
            id: macroTargetId,
            isActive: true,
          },
        });

    if (!macroTarget) {
      return null;
    }
    return Array.isArray(macroTargetId)
      ? macroTarget.map((item) => item.getData())
      : macroTarget.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMacroTargetById",
      err,
    );
  }
};

module.exports = getMacroTargetById;

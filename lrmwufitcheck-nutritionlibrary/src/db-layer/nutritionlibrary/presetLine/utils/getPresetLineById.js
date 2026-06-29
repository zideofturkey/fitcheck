const { HttpServerError } = require("common");

let { PresetLine } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getPresetLineById = async (presetLineId) => {
  try {
    const presetLine = Array.isArray(presetLineId)
      ? await PresetLine.findAll({
          where: {
            id: { [Op.in]: presetLineId },
            isActive: true,
          },
        })
      : await PresetLine.findOne({
          where: {
            id: presetLineId,
            isActive: true,
          },
        });

    if (!presetLine) {
      return null;
    }
    return Array.isArray(presetLineId)
      ? presetLine.map((item) => item.getData())
      : presetLine.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetLineById",
      err,
    );
  }
};

module.exports = getPresetLineById;

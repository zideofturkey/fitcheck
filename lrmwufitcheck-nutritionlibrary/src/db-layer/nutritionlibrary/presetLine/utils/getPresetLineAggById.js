const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MacroTarget, FoodItem, PresetMeal, PresetLine } = require("models");
const { Op } = require("sequelize");

const getPresetLineAggById = async (presetLineId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const presetLine = Array.isArray(presetLineId)
      ? await PresetLine.findAll({
          where: {
            id: { [Op.in]: presetLineId },
            isActive: true,
          },
          include: includes,
        })
      : await PresetLine.findOne({
          where: {
            id: presetLineId,
            isActive: true,
          },
          include: includes,
        });

    if (!presetLine) {
      return null;
    }

    const presetLineData =
      Array.isArray(presetLineId) && presetLineId.length > 0
        ? presetLine.map((item) => item.getData())
        : presetLine.getData();
    await PresetLine.getCqrsJoins(presetLineData);
    return presetLineData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetLineAggById",
      err,
    );
  }
};

module.exports = getPresetLineAggById;

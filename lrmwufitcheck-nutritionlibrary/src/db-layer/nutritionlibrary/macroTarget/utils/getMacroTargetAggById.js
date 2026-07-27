const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { MacroTarget, FoodItem, PresetMeal, PresetLine, Dish, DishLine } = require("models");
const { Op } = require("sequelize");

const getMacroTargetAggById = async (macroTargetId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const macroTarget = Array.isArray(macroTargetId)
      ? await MacroTarget.findAll({
          where: {
            id: { [Op.in]: macroTargetId },
            isActive: true,
          },
          include: includes,
        })
      : await MacroTarget.findOne({
          where: {
            id: macroTargetId,
            isActive: true,
          },
          include: includes,
        });

    if (!macroTarget) {
      return null;
    }

    const macroTargetData =
      Array.isArray(macroTargetId) && macroTargetId.length > 0
        ? macroTarget.map((item) => item.getData())
        : macroTarget.getData();
    await MacroTarget.getCqrsJoins(macroTargetData);
    return macroTargetData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMacroTargetAggById",
      err,
    );
  }
};

module.exports = getMacroTargetAggById;

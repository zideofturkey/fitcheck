const { HttpServerError } = require("common");

let { PresetMeal } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getPresetMealById = async (presetMealId) => {
  try {
    const presetMeal = Array.isArray(presetMealId)
      ? await PresetMeal.findAll({
          where: {
            id: { [Op.in]: presetMealId },
            isActive: true,
          },
        })
      : await PresetMeal.findOne({
          where: {
            id: presetMealId,
            isActive: true,
          },
        });

    if (!presetMeal) {
      return null;
    }
    return Array.isArray(presetMealId)
      ? presetMeal.map((item) => item.getData())
      : presetMeal.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetMealById",
      err,
    );
  }
};

module.exports = getPresetMealById;

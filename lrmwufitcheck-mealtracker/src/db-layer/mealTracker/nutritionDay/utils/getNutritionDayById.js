const { HttpServerError } = require("common");

let { NutritionDay } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getNutritionDayById = async (nutritionDayId) => {
  try {
    const nutritionDay = Array.isArray(nutritionDayId)
      ? await NutritionDay.findAll({
          where: {
            id: { [Op.in]: nutritionDayId },
          },
        })
      : await NutritionDay.findByPk(nutritionDayId);

    if (!nutritionDay) {
      return null;
    }
    return Array.isArray(nutritionDayId)
      ? nutritionDay.map((item) => item.getData())
      : nutritionDay.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayById",
      err,
    );
  }
};

module.exports = getNutritionDayById;

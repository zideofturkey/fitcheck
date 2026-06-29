const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { NutritionDay } = require("models");
const { Op } = require("sequelize");

const getIdListOfNutritionDayByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let nutritionDayIdList = await NutritionDay.findAll(options);

    if (!nutritionDayIdList) {
      throw new NotFoundError(
        `NutritionDay with the specified criteria not found`,
      );
    }

    nutritionDayIdList = nutritionDayIdList.map((item) => item.id);
    return nutritionDayIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingNutritionDayIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfNutritionDayByField;

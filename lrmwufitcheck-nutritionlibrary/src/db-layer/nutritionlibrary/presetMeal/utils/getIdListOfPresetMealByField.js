const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { PresetMeal } = require("models");
const { Op } = require("sequelize");

const getIdListOfPresetMealByField = async (fieldName, fieldValue, isArray) => {
  try {
    const options = {
      where: { isActive: true },
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true };
    }

    let presetMealIdList = await PresetMeal.findAll(options);

    if (!presetMealIdList) {
      throw new NotFoundError(
        `PresetMeal with the specified criteria not found`,
      );
    }

    presetMealIdList = presetMealIdList.map((item) => item.id);
    return presetMealIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetMealIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfPresetMealByField;

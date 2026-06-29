const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { MealLog } = require("models");
const { Op } = require("sequelize");

const getIdListOfMealLogByField = async (fieldName, fieldValue, isArray) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let mealLogIdList = await MealLog.findAll(options);

    if (!mealLogIdList) {
      throw new NotFoundError(`MealLog with the specified criteria not found`);
    }

    mealLogIdList = mealLogIdList.map((item) => item.id);
    return mealLogIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLogIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfMealLogByField;

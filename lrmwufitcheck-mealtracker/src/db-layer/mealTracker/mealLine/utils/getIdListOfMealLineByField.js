const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { MealLine } = require("models");
const { Op } = require("sequelize");

const getIdListOfMealLineByField = async (fieldName, fieldValue, isArray) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let mealLineIdList = await MealLine.findAll(options);

    if (!mealLineIdList) {
      throw new NotFoundError(`MealLine with the specified criteria not found`);
    }

    mealLineIdList = mealLineIdList.map((item) => item.id);
    return mealLineIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLineIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfMealLineByField;

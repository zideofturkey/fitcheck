const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { FoodItem } = require("models");
const { Op } = require("sequelize");

const getIdListOfFoodItemByField = async (fieldName, fieldValue, isArray) => {
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

    let foodItemIdList = await FoodItem.findAll(options);

    if (!foodItemIdList) {
      throw new NotFoundError(`FoodItem with the specified criteria not found`);
    }

    foodItemIdList = foodItemIdList.map((item) => item.id);
    return foodItemIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFoodItemIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfFoodItemByField;

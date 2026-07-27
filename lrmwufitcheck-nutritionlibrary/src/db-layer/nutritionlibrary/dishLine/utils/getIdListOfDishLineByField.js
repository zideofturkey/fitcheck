const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { DishLine } = require("models");
const { Op } = require("sequelize");

const getIdListOfDishLineByField = async (fieldName, fieldValue, isArray) => {
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

    let dishLineIdList = await DishLine.findAll(options);

    if (!dishLineIdList) {
      throw new NotFoundError(
        `DishLine with the specified criteria not found`,
      );
    }

    dishLineIdList = dishLineIdList.map((item) => item.id);
    return dishLineIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishLineIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfDishLineByField;

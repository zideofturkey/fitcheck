const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Dish } = require("models");
const { Op } = require("sequelize");

const getIdListOfDishByField = async (fieldName, fieldValue, isArray) => {
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

    let dishIdList = await Dish.findAll(options);

    if (!dishIdList) {
      throw new NotFoundError(`Dish with the specified criteria not found`);
    }

    dishIdList = dishIdList.map((item) => item.id);
    return dishIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDishIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfDishByField;

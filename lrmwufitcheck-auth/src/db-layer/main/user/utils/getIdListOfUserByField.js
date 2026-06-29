const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { User } = require("models");
const { Op } = require("sequelize");

const getIdListOfUserByField = async (fieldName, fieldValue, isArray) => {
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

    let userIdList = await User.findAll(options);

    if (!userIdList) {
      throw new NotFoundError(`User with the specified criteria not found`);
    }

    userIdList = userIdList.map((item) => item.id);
    return userIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfUserByField;

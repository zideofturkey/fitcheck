const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { UserAvatarsFile } = require("models");
const { Op } = require("sequelize");

const getIdListOfUserAvatarsFileByField = async (
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

    let userAvatarsFileIdList = await UserAvatarsFile.findAll(options);

    if (!userAvatarsFileIdList) {
      throw new NotFoundError(
        `UserAvatarsFile with the specified criteria not found`,
      );
    }

    userAvatarsFileIdList = userAvatarsFileIdList.map((item) => item.id);
    return userAvatarsFileIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfUserAvatarsFileByField;

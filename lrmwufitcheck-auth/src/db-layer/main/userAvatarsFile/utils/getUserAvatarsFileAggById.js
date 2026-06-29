const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { User, UserAvatarsFile } = require("models");
const { Op } = require("sequelize");

const getUserAvatarsFileAggById = async (userAvatarsFileId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const userAvatarsFile = Array.isArray(userAvatarsFileId)
      ? await UserAvatarsFile.findAll({
          where: {
            id: { [Op.in]: userAvatarsFileId },
          },
          include: includes,
        })
      : await UserAvatarsFile.findByPk(userAvatarsFileId, {
          include: includes,
        });

    if (!userAvatarsFile) {
      return null;
    }

    const userAvatarsFileData =
      Array.isArray(userAvatarsFileId) && userAvatarsFileId.length > 0
        ? userAvatarsFile.map((item) => item.getData())
        : userAvatarsFile.getData();
    await UserAvatarsFile.getCqrsJoins(userAvatarsFileData);
    return userAvatarsFileData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileAggById",
      err,
    );
  }
};

module.exports = getUserAvatarsFileAggById;

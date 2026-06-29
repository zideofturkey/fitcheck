const { HttpServerError } = require("common");

let { UserAvatarsFile } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getUserAvatarsFileById = async (userAvatarsFileId) => {
  try {
    const userAvatarsFile = Array.isArray(userAvatarsFileId)
      ? await UserAvatarsFile.findAll({
          where: {
            id: { [Op.in]: userAvatarsFileId },
          },
        })
      : await UserAvatarsFile.findByPk(userAvatarsFileId);

    if (!userAvatarsFile) {
      return null;
    }
    return Array.isArray(userAvatarsFileId)
      ? userAvatarsFile.map((item) => item.getData())
      : userAvatarsFile.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileById",
      err,
    );
  }
};

module.exports = getUserAvatarsFileById;

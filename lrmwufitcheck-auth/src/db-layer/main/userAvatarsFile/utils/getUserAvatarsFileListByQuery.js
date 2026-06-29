const { HttpServerError, BadRequestError } = require("common");

const { UserAvatarsFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getUserAvatarsFileListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getUserAvatarsFileListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const userAvatarsFile = await UserAvatarsFile.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!userAvatarsFile || userAvatarsFile.length === 0) return [];

    return userAvatarsFile.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileListByQuery",
      err,
    );
  }
};

module.exports = getUserAvatarsFileListByQuery;

const { HttpServerError, BadRequestError } = require("common");

const { UserAvatarsFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getUserAvatarsFileByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getUserAvatarsFileByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const userAvatarsFile = await UserAvatarsFile.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!userAvatarsFile) return null;
    return userAvatarsFile.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingUserAvatarsFileByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileByQuery",
      err,
    );
  }
};

module.exports = getUserAvatarsFileByQuery;

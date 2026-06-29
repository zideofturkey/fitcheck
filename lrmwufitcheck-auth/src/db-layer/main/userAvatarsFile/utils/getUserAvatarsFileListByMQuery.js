const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { UserAvatarsFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple UserAvatarsFile records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getUserAvatarsFileListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const userAvatarsFile = await UserAvatarsFile.findAll({
      where: query,
    });

    if (!userAvatarsFile || userAvatarsFile.length === 0) return [];

    return userAvatarsFile.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileListByMQuery",
      err,
    );
  }
};

module.exports = getUserAvatarsFileListByMQuery;

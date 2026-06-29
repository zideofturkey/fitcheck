const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { UserAvatarsFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single UserAvatarsFile matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getUserAvatarsFileByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const userAvatarsFile = await UserAvatarsFile.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!userAvatarsFile) return null;
    return userAvatarsFile.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingUserAvatarsFileByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserAvatarsFileByMQuery",
      err,
    );
  }
};

module.exports = getUserAvatarsFileByMQuery;

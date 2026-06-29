const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { User } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple User records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getUserListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    // Default soft-delete filter only when the caller did not explicitly set isActive
    const whereClause = Object.prototype.hasOwnProperty.call(query, "isActive")
      ? query
      : { ...query, isActive: true };
    const user = await User.findAll({
      where: whereClause,
    });

    if (!user || user.length === 0) return [];

    return user.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserListByMQuery",
      err,
    );
  }
};

module.exports = getUserListByMQuery;

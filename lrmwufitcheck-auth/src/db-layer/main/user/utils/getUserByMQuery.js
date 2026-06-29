const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { User } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single User matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getUserByMQuery = async (mQuery) => {
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
      : { [Op.and]: [query, { isActive: true }] };

    const user = await User.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!user) return null;
    return user.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingUserByMQuery", err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingUserByMQuery", err);
  }
};

module.exports = getUserByMQuery;

const { HttpServerError, BadRequestError } = require("common");

const { User } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getUserByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getUserByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

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
    console.log("errMsg_dbErrorWhenRequestingUserByQuery", err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingUserByQuery", err);
  }
};

module.exports = getUserByQuery;

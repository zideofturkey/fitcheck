const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { InviteLink } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple InviteLink records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getInviteLinkListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const inviteLink = await InviteLink.findAll({
      where: query,
    });

    if (!inviteLink || inviteLink.length === 0) return [];

    return inviteLink.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkListByMQuery",
      err,
    );
  }
};

module.exports = getInviteLinkListByMQuery;

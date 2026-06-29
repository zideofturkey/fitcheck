const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { Sys_toolCatalog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single Sys_toolCatalog matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getSys_toolCatalogByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const sys_toolCatalog = await Sys_toolCatalog.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_toolCatalog) return null;
    return sys_toolCatalog.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingSys_toolCatalogByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogByMQuery",
      err,
    );
  }
};

module.exports = getSys_toolCatalogByMQuery;

const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { Sys_toolCatalog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple Sys_toolCatalog records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getSys_toolCatalogListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const sys_toolCatalog = await Sys_toolCatalog.findAll({
      where: query,
    });

    if (!sys_toolCatalog || sys_toolCatalog.length === 0) return [];

    return sys_toolCatalog.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogListByMQuery",
      err,
    );
  }
};

module.exports = getSys_toolCatalogListByMQuery;

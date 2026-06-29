const { HttpServerError, BadRequestError } = require("common");

const { Sys_toolCatalog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_toolCatalogListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_toolCatalogListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const sys_toolCatalog = await Sys_toolCatalog.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!sys_toolCatalog || sys_toolCatalog.length === 0) return [];

    return sys_toolCatalog.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogListByQuery",
      err,
    );
  }
};

module.exports = getSys_toolCatalogListByQuery;

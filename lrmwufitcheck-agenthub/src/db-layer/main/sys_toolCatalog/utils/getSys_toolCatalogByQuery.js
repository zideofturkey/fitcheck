const { HttpServerError, BadRequestError } = require("common");

const { Sys_toolCatalog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_toolCatalogByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_toolCatalogByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const sys_toolCatalog = await Sys_toolCatalog.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!sys_toolCatalog) return null;
    return sys_toolCatalog.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingSys_toolCatalogByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogByQuery",
      err,
    );
  }
};

module.exports = getSys_toolCatalogByQuery;

const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const {
  Sys_agentOverride,
  Sys_agentExecution,
  Sys_toolCatalog,
  Sys_agentConversation,
} = require("models");
const { Op } = require("sequelize");

const getSys_toolCatalogAggById = async (sys_toolCatalogId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const sys_toolCatalog = Array.isArray(sys_toolCatalogId)
      ? await Sys_toolCatalog.findAll({
          where: {
            id: { [Op.in]: sys_toolCatalogId },
          },
          include: includes,
        })
      : await Sys_toolCatalog.findByPk(sys_toolCatalogId, {
          include: includes,
        });

    if (!sys_toolCatalog) {
      return null;
    }

    const sys_toolCatalogData =
      Array.isArray(sys_toolCatalogId) && sys_toolCatalogId.length > 0
        ? sys_toolCatalog.map((item) => item.getData())
        : sys_toolCatalog.getData();
    await Sys_toolCatalog.getCqrsJoins(sys_toolCatalogData);
    return sys_toolCatalogData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogAggById",
      err,
    );
  }
};

module.exports = getSys_toolCatalogAggById;

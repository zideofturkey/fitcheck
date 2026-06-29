const { HttpServerError } = require("common");

let { Sys_toolCatalog } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getSys_toolCatalogById = async (sys_toolCatalogId) => {
  try {
    const sys_toolCatalog = Array.isArray(sys_toolCatalogId)
      ? await Sys_toolCatalog.findAll({
          where: {
            id: { [Op.in]: sys_toolCatalogId },
          },
        })
      : await Sys_toolCatalog.findByPk(sys_toolCatalogId);

    if (!sys_toolCatalog) {
      return null;
    }
    return Array.isArray(sys_toolCatalogId)
      ? sys_toolCatalog.map((item) => item.getData())
      : sys_toolCatalog.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogById",
      err,
    );
  }
};

module.exports = getSys_toolCatalogById;

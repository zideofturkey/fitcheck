const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Sys_toolCatalog } = require("models");
const { Op } = require("sequelize");

const getIdListOfSys_toolCatalogByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let sys_toolCatalogIdList = await Sys_toolCatalog.findAll(options);

    if (!sys_toolCatalogIdList) {
      throw new NotFoundError(
        `Sys_toolCatalog with the specified criteria not found`,
      );
    }

    sys_toolCatalogIdList = sys_toolCatalogIdList.map((item) => item.id);
    return sys_toolCatalogIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSys_toolCatalogIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfSys_toolCatalogByField;

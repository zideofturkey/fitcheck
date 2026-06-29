const { HttpServerError, BadRequestError } = require("common");
const { UserAvatarsFile } = require("models");
const { Op } = require("sequelize");
const {
  deleteDataFromElastic,
  raiseDbEventDelete,
  deleteEntityCache,
  invalidateQueryCache,
} = require("./helper");

/**
 * @deprecated Use deleteUserAvatarsFileByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const deleteUserAvatarsFileByQuery = async (query, context = null) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const rows = await UserAvatarsFile.findAll({ where: query });
    if (!rows || rows.length === 0) return [];

    await UserAvatarsFile.destroy({ where: query });

    const resultList = [];
    for (const item of rows) {
      const _data = item.getData();
      await deleteEntityCache(item.id);
      await deleteDataFromElastic(item.id, context);
      await invalidateQueryCache(_data);
      await raiseDbEventDelete(_data, context);
      resultList.push(_data);
    }

    return resultList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenDeletingUserAvatarsFileByQuery",
      err,
    );
  }
};

module.exports = deleteUserAvatarsFileByQuery;

const { HttpServerError, BadRequestError } = require("common");
const { InviteLink } = require("models");
const { Op } = require("sequelize");
const {
  deleteDataFromElastic,
  raiseDbEventDelete,
  deleteEntityCache,
  invalidateQueryCache,
} = require("./helper");

/**
 * @deprecated Use deleteInviteLinkByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const deleteInviteLinkByQuery = async (query, context = null) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const rows = await InviteLink.findAll({ where: query });
    if (!rows || rows.length === 0) return [];

    await InviteLink.destroy({ where: query });

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
      "errMsg_dbErrorWhenDeletingInviteLinkByQuery",
      err,
    );
  }
};

module.exports = deleteInviteLinkByQuery;

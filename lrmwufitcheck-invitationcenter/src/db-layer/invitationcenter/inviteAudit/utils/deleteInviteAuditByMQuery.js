const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");
const { InviteAudit } = require("models");
const { Op } = require("sequelize");
const {
  deleteDataFromElastic,
  raiseDbEventDelete,
  deleteEntityCache,
  invalidateQueryCache,
} = require("./helper");

/**
 * Deletes all InviteAudit records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @param {Object} [context=null] - Context with session and requestId
 * @returns {Promise<Array<Object>>} Array of deleted records
 */
const deleteInviteAuditByMQuery = async (mQuery, context = null) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const rows = await InviteAudit.findAll({ where: query });
    if (!rows || rows.length === 0) return [];

    await InviteAudit.destroy({ where: query });

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
      "errMsg_dbErrorWhenDeletingInviteAuditByMQuery",
      err,
    );
  }
};

module.exports = deleteInviteAuditByMQuery;

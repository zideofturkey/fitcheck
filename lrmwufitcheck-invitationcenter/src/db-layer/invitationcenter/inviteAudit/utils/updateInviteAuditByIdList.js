const { HttpServerError, hasArrayMutations, resolveArrayMutationsInClause } =
  require("common");

const { InviteAudit } = require("models");
const { Op } = require("sequelize");
const {
  indexDataToElastic,
  raiseDbEventUpdate,
  updateEntityCache,
  invalidateQueryCache,
} = require("./helper");

const updateInviteAuditByIdList = async (
  idList,
  dataClause,
  context = null,
) => {
  try {
    let rows = [];
    const appliedDataById = new Map();

    const whereClause = { id: { [Op.in]: idList } };

    if (hasArrayMutations(dataClause)) {
      const existingRows = await InviteAudit.findAll({ where: whereClause });
      for (const item of existingRows) {
        const resolvedDataClause = resolveArrayMutationsInClause(
          dataClause,
          item.getData(),
        );
        const updateResult = await InviteAudit.update(resolvedDataClause, {
          where: { id: item.id },
          returning: true,
        });
        const updatedItem = updateResult[1]?.[0] ?? null;
        if (updatedItem) {
          rows.push(updatedItem);
          appliedDataById.set(updatedItem.id, resolvedDataClause);
        }
      }
    } else {
      const options = { where: whereClause, returning: true };
      [, rows] = await InviteAudit.update(dataClause, options);
    }

    for (const item of rows) {
      const _data = item.getData();
      await updateEntityCache(_data);
      await indexDataToElastic(_data, context);
      await invalidateQueryCache(_data);
      // For bulk updates, we don't have old data, so pass null
      const appliedDataClause = appliedDataById.get(item.id) ?? dataClause;
      await raiseDbEventUpdate(_data, null, appliedDataClause, context);
    }

    const inviteAuditIdList = rows.map((item) => item.id);
    return inviteAuditIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingInviteAuditByIdList",
      err,
    );
  }
};

module.exports = updateInviteAuditByIdList;

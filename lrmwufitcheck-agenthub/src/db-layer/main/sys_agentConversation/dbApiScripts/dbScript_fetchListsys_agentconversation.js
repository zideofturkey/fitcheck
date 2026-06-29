// This script is written as api-specific
// This script is called from the _fetchListSys_agentConversationManager

const { Sys_agentConversation, sequelize } = require("models");
const { HttpServerError, HttpError } = require("common");

const { Op } = require("sequelize");

function normalizeSequalizeOps(seqObj) {
  if (typeof seqObj !== "object") return seqObj;
  if (!seqObj) return null;
  const keys = Object.keys(seqObj);
  const symbolKeys = Object.getOwnPropertySymbols(seqObj);
  const newObj = {};
  for (const key of keys) {
    seqObj[key] = normalizeSequalizeOps(seqObj[key]);
  }

  for (const key of symbolKeys) {
    let index = 0;
    let newKey = "";
    if (key == Op.eq) newKey = "$op.eq";
    if (key == Op.in) newKey = "$op.in";
    if (key == Op.and) newKey = "$op.and";
    if (key == Op.or) newKey = "$op.or";
    if (key == Op.notIn) newKey = "$op.notIn";
    if (key == Op.not) newKey = "$op.not";
    if (key == Op.ne) newKey = "$op.ne";
    if (key == Op.contains) newKey = "$op.contains";
    if (key == Op.notContains) newKey = "$op.notContains";
    if (key == Op.overlap) newKey = "$op.overlap";
    if (key == Op.gt) newKey = "$op.gt";
    if (key == Op.gte) newKey = "$op.gte";
    if (key == Op.lt) newKey = "$op.lt";
    if (key == Op.lte) newKey = "$op.lte";
    if (key == Op.like) newKey = "$op.like";
    if (key == Op.iLike) newKey = "$op.iLike";
    if (key == Op.between) newKey = "$op.between";
    if (newKey) {
      seqObj[newKey] = seqObj[key];
      delete seqObj[key];
    } else {
      newKey = key;
    }
    if (Array.isArray(seqObj[newKey])) {
      seqObj[newKey] = seqObj[newKey].map((item) =>
        normalizeSequalizeOps(item),
      );
    } else {
      seqObj[newKey] = normalizeSequalizeOps(seqObj[newKey]);
    }
  }
  return seqObj;
}

const dbScript_fetchListsys_agentconversation = async (apiManager) => {
  const rawWhereClause = apiManager.whereClause;

  const whereClause = rawWhereClause;

  try {
    let options = { where: whereClause };
    const sortBy = apiManager.getSortBy();
    options.order = sortBy ?? [["id", "ASC"]];

    if (apiManager.pagination) {
      options.limit = apiManager.pagination.pageRowCount;
      if (apiManager.pagination.cursorMode) {
        options.order = [
          ["createdAt", "ASC"],
          ["id", "ASC"],
        ];
        if (apiManager.pagination.cursor) {
          const _cursor = apiManager.pagination.cursor;
          const _cursorCondition = {
            [Op.or]: [
              { createdAt: { [Op.gt]: _cursor.createdAt } },
              { createdAt: _cursor.createdAt, id: { [Op.gt]: _cursor.id } },
            ],
          };
          options.where = options.where
            ? { [Op.and]: [options.where, _cursorCondition] }
            : _cursorCondition;
        }
      } else if (apiManager.pagination.pageNumber) {
        options.offset =
          apiManager.pagination.pageRowCount *
          (apiManager.pagination.pageNumber - 1);
      }
    }

    const selectList = apiManager.getSelectList() ?? [];
    if (selectList.length) {
      options.attributes = selectList;
    }

    let sys_agentConversationList =
      await Sys_agentConversation.findAll(options);

    const dbData = { items: [] };
    apiManager.sys_agentConversations = [];
    if (!sys_agentConversationList || sys_agentConversationList.length == 0)
      return dbData;

    dbData.items = Array.isArray(sys_agentConversationList)
      ? sys_agentConversationList
      : [sys_agentConversationList];
    dbData.items = dbData.items.map((item) => item.getData());

    dbData.totalRowCount = dbData.items.length;
    dbData.pageCount = 1;

    if (apiManager.pagination && apiManager.pagination.pageNumber) {
      let attributes = [
        [
          sequelize.literal('COUNT(DISTINCT("sys_agentConversation".id))'),
          "_COUNT",
        ],
      ];
      let sys_agentConversation_count = await Sys_agentConversation.findAll({
        where: whereClause,
        raw: true,
        attributes,
      });
      sys_agentConversation_count =
        sys_agentConversation_count && sys_agentConversation_count.length
          ? sys_agentConversation_count[0]._COUNT
          : 0;
      sys_agentConversation_count = isNaN(sys_agentConversation_count)
        ? sys_agentConversation_count
        : parseInt(sys_agentConversation_count);

      sys_agentConversationList = {
        rows: sys_agentConversationList,
        count: sys_agentConversation_count,
      };
      dbData.totalRowCount = sys_agentConversation_count;
      dbData.pageCount = Math.ceil(
        dbData.totalRowCount / apiManager.pagination.pageRowCount,
      );
      dbData.paging = {
        pageNumber: apiManager.pagination.pageNumber,
        pageRowCount: apiManager.pagination.pageRowCount,
        totalRowCount: dbData.totalRowCount,
        pageCount: dbData.pageCount,
      };
    }

    apiManager.sys_agentConversations = dbData.items;

    return dbData;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenExecuting_dbScript_fetchListsys_agentconversation",
      {
        whereClause: normalizeSequalizeOps(whereClause),
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
      },
    );
  }
};

module.exports = dbScript_fetchListsys_agentconversation;

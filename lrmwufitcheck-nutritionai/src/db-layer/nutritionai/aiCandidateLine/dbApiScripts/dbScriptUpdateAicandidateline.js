// This script is written as api-specific
// This script is called from the UpdateAiCandidateLineManager

const { AiCandidateLine } = require("models");

const {
  AiCandidateLineQueryCacheInvalidator,
} = require("./query-cache-classes");

const {
  HttpServerError,
  HttpError,
  NotFoundError,
  checkSame,
  resolveArrayMutationsInClause,
} = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { ServicePublisher } = require("serviceCommon");

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

function getEventPayload(apiManager, dataClause) {
  const oldData = apiManager.getInstance();
  const newData = apiManager.aiCandidateLine;
  return {
    old_aiCandidateLine: oldData,
    aiCandidateLine: newData,
    oldDataValues: getOldDataValues(dataClause, oldData),
    newDataValues: getNewDataValues(dataClause, newData),
  };
}

function getOldDataValues(dataClause, oldDbData) {
  const values = {};
  for (const propName of Object.keys(dataClause ?? {})) {
    values[propName] = oldDbData ? oldDbData[propName] : undefined;
  }
  return values;
}

function getNewDataValues(dataClause, newDbData) {
  const values = {};
  for (const propName of Object.keys(dataClause ?? {})) {
    values[propName] = newDbData ? newDbData[propName] : undefined;
  }
  return values;
}

function clearDataClause(dataClause, oldDbData) {
  for (const key of Object.keys(dataClause)) {
    if (dataClause[key] === undefined) delete dataClause[key];
  }
  for (const key of Object.keys(dataClause)) {
    if (checkSame(dataClause[key], oldDbData[key])) {
      // check if only 1 key is left before deleting, bacause 0 key will cause an error
      if (Object.keys(dataClause).length > 1) delete dataClause[key];
    }
  }
}

async function raiseDbEvent(apiManager, eventData) {
  const dbEvent = apiManager.getDbEventTopic("update");

  try {
    const _publisher = new ServicePublisher(
      dbEvent,
      eventData,
      apiManager.session,
      apiManager.requestId,
    );
    await _publisher.publish();
  } catch (err) {
    //**errorLog
    console.log("DbEvent cant be published", dbEvent, err);
  }
}

const dbScriptUpdateAicandidateline = async (apiManager) => {
  const whereClause = apiManager.whereClause;
  const dataClause = apiManager.getDataClause();
  let resolvedDataClause = dataClause;

  try {
    const oldDbData = apiManager.getInstance();
    const instanceWhereClause = { id: oldDbData.id };
    resolvedDataClause = resolveArrayMutationsInClause(dataClause, oldDbData);

    clearDataClause(resolvedDataClause, oldDbData);

    console.log(
      "[DbScript:dbScriptUpdateAicandidateline] dataClause after clear:",
      JSON.stringify(resolvedDataClause),
    );
    console.log(
      "[DbScript:dbScriptUpdateAicandidateline] whereClause:",
      require("util").inspect(whereClause, { depth: 4 }),
    );

    const updateResult = await AiCandidateLine.update(resolvedDataClause, {
      where: instanceWhereClause,
      returning: true,
    });
    const rowsCount = updateResult[0];
    let dbDoc = updateResult[1]?.[0] ?? null;
    let dbData = dbDoc ? dbDoc.getData() : null;

    console.log(
      "[DbScript:dbScriptUpdateAicandidateline] updateResult: rowsCount=",
      rowsCount,
      "hasReturningData=",
      !!dbDoc,
      "hasDbData=",
      !!dbData,
    );

    if (!dbData && rowsCount > 0) {
      console.log(
        "[DbScript:dbScriptUpdateAicandidateline] re-fetching after update (returning was empty but rowsCount > 0)",
      );
      dbDoc = await AiCandidateLine.findOne({ where: instanceWhereClause });
      dbData = dbDoc ? dbDoc.getData() : null;
    }

    if (!dbData && rowsCount === 0 && oldDbData?.id) {
      console.log(
        "[DbScript:dbScriptUpdateAicandidateline] update matched 0 rows — re-fetching by id:",
        oldDbData.id,
      );
      dbDoc = await AiCandidateLine.findOne({ where: instanceWhereClause });
      dbData = dbDoc ? dbDoc.getData() : null;
    }

    if (!dbData) {
      console.log(
        "[DbScript:dbScriptUpdateAicandidateline] FAILED: no data after update. rowsCount=",
        rowsCount,
        "updateResult length=",
        updateResult.length,
        "updateResult[1] type=",
        typeof updateResult[1],
      );
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    apiManager.aiCandidateLine = dbData;

    const elasticIndexer = new ElasticIndexer(
      "aiCandidateLine",
      apiManager.session,
      apiManager.requestId,
    );
    await elasticIndexer.indexData(dbData);

    // invalidate the query caches that are related with this object's old and new state
    const queryCacheInvalidator = new AiCandidateLineQueryCacheInvalidator();

    queryCacheInvalidator.invalidateCache(dbData);
    queryCacheInvalidator.invalidateCache(oldDbData);

    const eventData = await getEventPayload(apiManager, resolvedDataClause);

    await raiseDbEvent(apiManager, eventData);

    apiManager.oldDataValues = eventData.oldDataValues;
    apiManager.newDataValues = eventData.newDataValues;

    return dbData;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenExecuting_dbScriptUpdateAicandidateline",
      {
        whereClause: normalizeSequalizeOps(whereClause),
        dataClause: resolvedDataClause,
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        paymentResult: apiManager.paymentResult,
      },
    );
  }
};

module.exports = dbScriptUpdateAicandidateline;

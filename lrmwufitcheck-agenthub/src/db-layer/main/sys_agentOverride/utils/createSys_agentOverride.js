const { HttpServerError, HttpError, BadRequestError } = require("common");

const { Sys_agentOverride } = require("models");
const { hexaLogger, newUUID } = require("common");
const {
  indexDataToElastic,
  raiseDbEventCreate,
  createEntityCache,
  invalidateQueryCache,
} = require("./helper");

const validateData = (data) => {
  if (!data.id) {
    data.id = newUUID();
  }
};

async function checkForUniqueIndex(data) {
  const whereClause = {
    agentName: data.agentName ?? null,
  };
  const dbDoc = await Sys_agentOverride.findOne({ where: whereClause });
  if (dbDoc) {
    throw new BadRequestError(
      "errMsg_DuplicateUniqueIndexError:agentName-index",
    );
  }

  return null;
}

const createSys_agentOverride = async (data, context = null) => {
  try {
    validateData(data);

    const current_sys_agentOverride = data.id
      ? await Sys_agentOverride.findByPk(data.id)
      : null;
    let newsys_agentOverride = null;

    if (current_sys_agentOverride) {
      delete data.id;

      await current_sys_agentOverride.update(data);
      newsys_agentOverride = current_sys_agentOverride;
    }

    if (!newsys_agentOverride) {
      //check for unique index
      newsys_agentOverride = await checkForUniqueIndex(data);
    }

    if (!newsys_agentOverride) {
      newsys_agentOverride = await Sys_agentOverride.create(data);
    }

    const _data = newsys_agentOverride.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenCreatingSys_agentOverride",
      err,
    );
  }
};

module.exports = createSys_agentOverride;

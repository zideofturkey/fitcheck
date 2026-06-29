const { HttpServerError, HttpError, BadRequestError } = require("common");

const { Sys_agentConversation } = require("models");
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
    sessionId: data.sessionId ?? null,
  };
  const dbDoc = await Sys_agentConversation.findOne({ where: whereClause });
  if (dbDoc) {
    throw new BadRequestError(
      "errMsg_DuplicateUniqueIndexError:sessionId-index",
    );
  }

  return null;
}

const createSys_agentConversation = async (data, context = null) => {
  try {
    validateData(data);

    const current_sys_agentConversation = data.id
      ? await Sys_agentConversation.findByPk(data.id)
      : null;
    let newsys_agentConversation = null;

    if (current_sys_agentConversation) {
      delete data.id;

      await current_sys_agentConversation.update(data);
      newsys_agentConversation = current_sys_agentConversation;
    }

    if (!newsys_agentConversation) {
      //check for unique index
      newsys_agentConversation = await checkForUniqueIndex(data);
    }

    if (!newsys_agentConversation) {
      newsys_agentConversation = await Sys_agentConversation.create(data);
    }

    const _data = newsys_agentConversation.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenCreatingSys_agentConversation",
      err,
    );
  }
};

module.exports = createSys_agentConversation;

const { HttpServerError, HttpError, BadRequestError } = require("common");

const { Sys_agentExecution } = require("models");
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

const createSys_agentExecution = async (data, context = null) => {
  try {
    validateData(data);

    const current_sys_agentExecution = data.id
      ? await Sys_agentExecution.findByPk(data.id)
      : null;
    let newsys_agentExecution = null;

    if (current_sys_agentExecution) {
      delete data.id;

      await current_sys_agentExecution.update(data);
      newsys_agentExecution = current_sys_agentExecution;
    }

    if (!newsys_agentExecution) {
      newsys_agentExecution = await Sys_agentExecution.create(data);
    }

    const _data = newsys_agentExecution.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenCreatingSys_agentExecution",
      err,
    );
  }
};

module.exports = createSys_agentExecution;

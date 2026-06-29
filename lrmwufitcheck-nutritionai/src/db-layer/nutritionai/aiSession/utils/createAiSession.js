const { HttpServerError, HttpError, BadRequestError } = require("common");

const { AiSession } = require("models");
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

const createAiSession = async (data, context = null) => {
  try {
    validateData(data);

    const current_aiSession = data.id
      ? await AiSession.findByPk(data.id)
      : null;
    let newaiSession = null;

    if (current_aiSession) {
      delete data.id;

      await current_aiSession.update(data);
      newaiSession = current_aiSession;
    }

    if (!newaiSession) {
      newaiSession = await AiSession.create(data);
    }

    const _data = newaiSession.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingAiSession", err);
  }
};

module.exports = createAiSession;

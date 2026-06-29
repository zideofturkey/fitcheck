const { HttpServerError, HttpError, BadRequestError } = require("common");

const { AiCandidateLine } = require("models");
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

const createAiCandidateLine = async (data, context = null) => {
  try {
    validateData(data);

    const current_aiCandidateLine = data.id
      ? await AiCandidateLine.findByPk(data.id)
      : null;
    let newaiCandidateLine = null;

    if (current_aiCandidateLine) {
      delete data.id;

      await current_aiCandidateLine.update(data);
      newaiCandidateLine = current_aiCandidateLine;
    }

    if (!newaiCandidateLine) {
      newaiCandidateLine = await AiCandidateLine.create(data);
    }

    const _data = newaiCandidateLine.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingAiCandidateLine", err);
  }
};

module.exports = createAiCandidateLine;

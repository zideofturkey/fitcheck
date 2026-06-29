const { HttpServerError, HttpError, BadRequestError } = require("common");

const { AiCandidateMeal } = require("models");
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

const createAiCandidateMeal = async (data, context = null) => {
  try {
    validateData(data);

    const current_aiCandidateMeal = data.id
      ? await AiCandidateMeal.findByPk(data.id)
      : null;
    let newaiCandidateMeal = null;

    if (current_aiCandidateMeal) {
      delete data.id;

      await current_aiCandidateMeal.update(data);
      newaiCandidateMeal = current_aiCandidateMeal;
    }

    if (!newaiCandidateMeal) {
      newaiCandidateMeal = await AiCandidateMeal.create(data);
    }

    const _data = newaiCandidateMeal.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingAiCandidateMeal", err);
  }
};

module.exports = createAiCandidateMeal;

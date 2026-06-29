const { HttpServerError, HttpError, BadRequestError } = require("common");

const { AiGuidanceNote } = require("models");
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

const createAiGuidanceNote = async (data, context = null) => {
  try {
    validateData(data);

    const current_aiGuidanceNote = data.id
      ? await AiGuidanceNote.findByPk(data.id)
      : null;
    let newaiGuidanceNote = null;

    if (current_aiGuidanceNote) {
      delete data.id;

      await current_aiGuidanceNote.update(data);
      newaiGuidanceNote = current_aiGuidanceNote;
    }

    if (!newaiGuidanceNote) {
      newaiGuidanceNote = await AiGuidanceNote.create(data);
    }

    const _data = newaiGuidanceNote.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingAiGuidanceNote", err);
  }
};

module.exports = createAiGuidanceNote;

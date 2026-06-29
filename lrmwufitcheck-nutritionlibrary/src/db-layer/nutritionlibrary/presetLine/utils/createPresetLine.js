const { HttpServerError, HttpError, BadRequestError } = require("common");

const { PresetLine } = require("models");
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

const createPresetLine = async (data, context = null) => {
  try {
    validateData(data);

    const current_presetLine = data.id
      ? await PresetLine.findByPk(data.id)
      : null;
    let newpresetLine = null;

    if (current_presetLine) {
      delete data.id;
      data.isActive = true;
      await current_presetLine.update(data);
      newpresetLine = current_presetLine;
    }

    if (!newpresetLine) {
      newpresetLine = await PresetLine.create(data);
    }

    const _data = newpresetLine.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingPresetLine", err);
  }
};

module.exports = createPresetLine;

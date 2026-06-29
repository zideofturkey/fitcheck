const { HttpServerError, HttpError, BadRequestError } = require("common");

const { PresetMeal } = require("models");
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

const createPresetMeal = async (data, context = null) => {
  try {
    validateData(data);

    const current_presetMeal = data.id
      ? await PresetMeal.findByPk(data.id)
      : null;
    let newpresetMeal = null;

    if (current_presetMeal) {
      delete data.id;
      data.isActive = true;
      await current_presetMeal.update(data);
      newpresetMeal = current_presetMeal;
    }

    if (!newpresetMeal) {
      newpresetMeal = await PresetMeal.create(data);
    }

    const _data = newpresetMeal.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingPresetMeal", err);
  }
};

module.exports = createPresetMeal;

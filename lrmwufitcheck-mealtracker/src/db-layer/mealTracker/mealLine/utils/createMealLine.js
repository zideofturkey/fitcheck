const { HttpServerError, HttpError, BadRequestError } = require("common");

const { MealLine } = require("models");
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

const createMealLine = async (data, context = null) => {
  try {
    validateData(data);

    const current_mealLine = data.id ? await MealLine.findByPk(data.id) : null;
    let newmealLine = null;

    if (current_mealLine) {
      delete data.id;

      await current_mealLine.update(data);
      newmealLine = current_mealLine;
    }

    if (!newmealLine) {
      newmealLine = await MealLine.create(data);
    }

    const _data = newmealLine.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingMealLine", err);
  }
};

module.exports = createMealLine;

const { HttpServerError, HttpError, BadRequestError } = require("common");

const { MealLog } = require("models");
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

const createMealLog = async (data, context = null) => {
  try {
    validateData(data);

    const current_mealLog = data.id ? await MealLog.findByPk(data.id) : null;
    let newmealLog = null;

    if (current_mealLog) {
      delete data.id;

      await current_mealLog.update(data);
      newmealLog = current_mealLog;
    }

    if (!newmealLog) {
      newmealLog = await MealLog.create(data);
    }

    const _data = newmealLog.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingMealLog", err);
  }
};

module.exports = createMealLog;

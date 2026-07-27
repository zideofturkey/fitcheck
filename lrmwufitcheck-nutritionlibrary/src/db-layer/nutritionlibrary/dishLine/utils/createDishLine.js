const { HttpServerError, HttpError, BadRequestError } = require("common");

const { DishLine } = require("models");
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

const createDishLine = async (data, context = null) => {
  try {
    validateData(data);

    const current_dishLine = data.id
      ? await DishLine.findByPk(data.id)
      : null;
    let newdishLine = null;

    if (current_dishLine) {
      delete data.id;
      data.isActive = true;
      await current_dishLine.update(data);
      newdishLine = current_dishLine;
    }

    if (!newdishLine) {
      newdishLine = await DishLine.create(data);
    }

    const _data = newdishLine.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingDishLine", err);
  }
};

module.exports = createDishLine;

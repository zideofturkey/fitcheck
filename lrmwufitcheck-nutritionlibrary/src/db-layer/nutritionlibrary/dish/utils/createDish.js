const { HttpServerError, HttpError, BadRequestError } = require("common");

const { Dish } = require("models");
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

const createDish = async (data, context = null) => {
  try {
    validateData(data);

    const current_dish = data.id ? await Dish.findByPk(data.id) : null;
    let newdish = null;

    if (current_dish) {
      delete data.id;
      data.isActive = true;
      await current_dish.update(data);
      newdish = current_dish;
    }

    if (!newdish) {
      newdish = await Dish.create(data);
    }

    const _data = newdish.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingDish", err);
  }
};

module.exports = createDish;

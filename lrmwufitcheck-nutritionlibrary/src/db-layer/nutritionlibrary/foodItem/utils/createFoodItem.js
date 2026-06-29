const { HttpServerError, HttpError, BadRequestError } = require("common");

const { FoodItem } = require("models");
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

const createFoodItem = async (data, context = null) => {
  try {
    validateData(data);

    const current_foodItem = data.id ? await FoodItem.findByPk(data.id) : null;
    let newfoodItem = null;

    if (current_foodItem) {
      delete data.id;
      data.isActive = true;
      await current_foodItem.update(data);
      newfoodItem = current_foodItem;
    }

    if (!newfoodItem) {
      newfoodItem = await FoodItem.create(data);
    }

    const _data = newfoodItem.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingFoodItem", err);
  }
};

module.exports = createFoodItem;

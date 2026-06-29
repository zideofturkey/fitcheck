const { HttpServerError, HttpError, BadRequestError } = require("common");

const { MacroTarget } = require("models");
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

const createMacroTarget = async (data, context = null) => {
  try {
    validateData(data);

    const current_macroTarget = data.id
      ? await MacroTarget.findByPk(data.id)
      : null;
    let newmacroTarget = null;

    if (current_macroTarget) {
      delete data.id;
      data.isActive = true;
      await current_macroTarget.update(data);
      newmacroTarget = current_macroTarget;
    }

    if (!newmacroTarget) {
      newmacroTarget = await MacroTarget.create(data);
    }

    const _data = newmacroTarget.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingMacroTarget", err);
  }
};

module.exports = createMacroTarget;

const { HttpServerError, HttpError, BadRequestError } = require("common");

const { Sys_toolCatalog } = require("models");
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

async function checkForUniqueIndex(data) {
  const whereClause = {
    toolName: data.toolName ?? null,
  };
  const dbDoc = await Sys_toolCatalog.findOne({ where: whereClause });
  if (dbDoc) {
    throw new BadRequestError(
      "errMsg_DuplicateUniqueIndexError:toolName-index",
    );
  }

  return null;
}

const createSys_toolCatalog = async (data, context = null) => {
  try {
    validateData(data);

    const current_sys_toolCatalog = data.id
      ? await Sys_toolCatalog.findByPk(data.id)
      : null;
    let newsys_toolCatalog = null;

    if (current_sys_toolCatalog) {
      delete data.id;

      await current_sys_toolCatalog.update(data);
      newsys_toolCatalog = current_sys_toolCatalog;
    }

    if (!newsys_toolCatalog) {
      //check for unique index
      newsys_toolCatalog = await checkForUniqueIndex(data);
    }

    if (!newsys_toolCatalog) {
      newsys_toolCatalog = await Sys_toolCatalog.create(data);
    }

    const _data = newsys_toolCatalog.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingSys_toolCatalog", err);
  }
};

module.exports = createSys_toolCatalog;

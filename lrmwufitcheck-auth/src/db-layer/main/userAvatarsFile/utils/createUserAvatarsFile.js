const { HttpServerError, HttpError, BadRequestError } = require("common");

const { UserAvatarsFile } = require("models");
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
    accessKey: data.accessKey ?? null,
  };
  const dbDoc = await UserAvatarsFile.findOne({ where: whereClause });
  if (dbDoc) {
    throw new BadRequestError(
      "errMsg_DuplicateUniqueIndexError:accessKey-index",
    );
  }

  return null;
}

const createUserAvatarsFile = async (data, context = null) => {
  try {
    validateData(data);

    const current_userAvatarsFile = data.id
      ? await UserAvatarsFile.findByPk(data.id)
      : null;
    let newuserAvatarsFile = null;

    if (current_userAvatarsFile) {
      delete data.id;

      await current_userAvatarsFile.update(data);
      newuserAvatarsFile = current_userAvatarsFile;
    }

    if (!newuserAvatarsFile) {
      //check for unique index
      newuserAvatarsFile = await checkForUniqueIndex(data);
    }

    if (!newuserAvatarsFile) {
      newuserAvatarsFile = await UserAvatarsFile.create(data);
    }

    const _data = newuserAvatarsFile.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingUserAvatarsFile", err);
  }
};

module.exports = createUserAvatarsFile;

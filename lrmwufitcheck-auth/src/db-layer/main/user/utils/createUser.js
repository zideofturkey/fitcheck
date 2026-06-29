const { HttpServerError, HttpError, BadRequestError } = require("common");

const { User } = require("models");
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
    email: data.email ?? null,

    isActive: true,
  };
  const dbDoc = await User.findOne({ where: whereClause });
  if (dbDoc) {
    throw new BadRequestError("errMsg_DuplicateUniqueIndexError:email-index");
  }

  return null;
}

const createUser = async (data, context = null) => {
  try {
    validateData(data);

    const current_user = data.id ? await User.findByPk(data.id) : null;
    let newuser = null;

    if (current_user) {
      delete data.id;
      data.isActive = true;
      await current_user.update(data);
      newuser = current_user;
    }

    if (!newuser) {
      //check for unique index
      newuser = await checkForUniqueIndex(data);
    }

    if (!newuser) {
      newuser = await User.create(data);
    }

    const _data = newuser.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingUser", err);
  }
};

module.exports = createUser;

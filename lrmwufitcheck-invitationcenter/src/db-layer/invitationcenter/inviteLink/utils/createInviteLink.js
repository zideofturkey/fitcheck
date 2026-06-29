const { HttpServerError, HttpError, BadRequestError } = require("common");

const { InviteLink } = require("models");
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
    inviteCode: data.inviteCode ?? null,
  };
  const dbDoc = await InviteLink.findOne({ where: whereClause });
  if (dbDoc) {
    throw new BadRequestError(
      "errMsg_DuplicateUniqueIndexError:inviteCodeUniqueIndex",
    );
  }

  return null;
}

const createInviteLink = async (data, context = null) => {
  try {
    validateData(data);

    const current_inviteLink = data.id
      ? await InviteLink.findByPk(data.id)
      : null;
    let newinviteLink = null;

    if (current_inviteLink) {
      delete data.id;

      await current_inviteLink.update(data);
      newinviteLink = current_inviteLink;
    }

    if (!newinviteLink) {
      //check for unique index
      newinviteLink = await checkForUniqueIndex(data);
    }

    if (!newinviteLink) {
      newinviteLink = await InviteLink.create(data);
    }

    const _data = newinviteLink.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingInviteLink", err);
  }
};

module.exports = createInviteLink;

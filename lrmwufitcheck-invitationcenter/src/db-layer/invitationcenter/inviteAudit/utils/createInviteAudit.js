const { HttpServerError, HttpError, BadRequestError } = require("common");

const { InviteAudit } = require("models");
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

const createInviteAudit = async (data, context = null) => {
  try {
    validateData(data);

    const current_inviteAudit = data.id
      ? await InviteAudit.findByPk(data.id)
      : null;
    let newinviteAudit = null;

    if (current_inviteAudit) {
      delete data.id;

      await current_inviteAudit.update(data);
      newinviteAudit = current_inviteAudit;
    }

    if (!newinviteAudit) {
      newinviteAudit = await InviteAudit.create(data);
    }

    const _data = newinviteAudit.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingInviteAudit", err);
  }
};

module.exports = createInviteAudit;

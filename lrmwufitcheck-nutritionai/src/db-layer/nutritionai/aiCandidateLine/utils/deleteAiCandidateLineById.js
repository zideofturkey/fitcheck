//ask about this no other option other than softdelete
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { AiCandidateLine } = require("models");
const {
  deleteDataFromElastic,
  raiseDbEventDelete,
  deleteEntityCache,
  invalidateQueryCache,
} = require("./helper");

const deleteAiCandidateLineById = async (id, context = null) => {
  try {
    if (typeof id === "object") {
      id = id.id;
    }
    if (!id)
      throw new BadRequestError("ID is required in utility delete function");

    const existingDoc = await AiCandidateLine.findByPk(id);
    if (!existingDoc) {
      throw new NotFoundError(`Record with ID ${id} not found.`);
    }

    const _data = existingDoc.getData();
    await existingDoc.destroy();

    await deleteEntityCache(id);
    await deleteDataFromElastic(id, context);
    await invalidateQueryCache(_data);
    await raiseDbEventDelete(_data, context);

    return _data;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "An unexpected error occurred during the delete operation.",
      err,
    );
  }
};

module.exports = deleteAiCandidateLineById;

//ask about this no other option other than softdelete
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { Dish } = require("models");
const {
  deleteDataFromElastic,
  raiseDbEventDelete,
  deleteEntityCache,
  invalidateQueryCache,
} = require("./helper");

const deleteDishById = async (id, context = null) => {
  try {
    if (typeof id === "object") {
      id = id.id;
    }
    if (!id)
      throw new BadRequestError("ID is required in utility delete function");

    const existingDoc = await Dish.findOne({
      where: { id, isActive: true },
    });
    if (!existingDoc) {
      throw new NotFoundError(`Record with ID ${id} not found.`);
    }
    const dataClause = { isActive: false, _archivedAt: new Date() };
    await existingDoc.update(dataClause);

    const _data = existingDoc.getData();
    await deleteEntityCache(existingDoc.id);
    await deleteDataFromElastic(existingDoc.id, context);
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

module.exports = deleteDishById;

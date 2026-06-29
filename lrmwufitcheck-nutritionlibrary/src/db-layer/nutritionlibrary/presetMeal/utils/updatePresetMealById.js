const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
  resolveArrayMutationsInClause,
} = require("common");
const { PresetMeal } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");
const {
  indexDataToElastic,
  raiseDbEventUpdate,
  updateEntityCache,
  invalidateQueryCache,
} = require("./helper");

const updatePresetMealById = async (id, dataClause, context = null) => {
  try {
    if (!id && dataClause.id) {
      id = dataClause.id;
      delete dataClause.id;
    }

    if (typeof id === "object") {
      if (!dataClause) dataClause = id;
      id = id.id;
      delete dataClause.id;
    }

    if (!id)
      throw new BadRequestError("ID is required in utility update function");

    const where = { id };
    if (dataClause.isActive == null) where.isActive = true;
    const existingDoc = await PresetMeal.findOne({ where });

    if (!existingDoc) {
      throw new NotFoundError(`Record with ID ${id} not found.`);
    }
    const resolvedDataClause = resolveArrayMutationsInClause(
      dataClause,
      existingDoc.getData(),
    );

    const wherex = { id };
    if (dataClause.isActive == null) wherex.isActive = true;
    const options = { where: wherex, returning: true };

    const updateResult = await PresetMeal.update(resolvedDataClause, options);
    const rowsCount = updateResult[0];
    let dbDoc = updateResult[1]?.[0] ?? null;

    // If rows were affected but returning didn't provide data, re-fetch
    if (!dbDoc && rowsCount > 0) {
      dbDoc = await PresetMeal.findOne({ where: options.where });
    }
    if (!dbDoc) {
      throw new NotFoundError("Record not found for update.");
    }
    const _data = dbDoc.getData();
    const oldData = existingDoc.getData();
    await updateEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data, oldData);
    await raiseDbEventUpdate(_data, oldData, resolvedDataClause, context);
    return _data;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "An unexpected error occurred during the update operation.",
      err,
    );
  }
};

module.exports = updatePresetMealById;

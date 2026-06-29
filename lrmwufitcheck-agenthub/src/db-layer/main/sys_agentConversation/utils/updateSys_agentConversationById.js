const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
  resolveArrayMutationsInClause,
} = require("common");
const { Sys_agentConversation } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");
const {
  indexDataToElastic,
  raiseDbEventUpdate,
  updateEntityCache,
  invalidateQueryCache,
} = require("./helper");

const updateSys_agentConversationById = async (
  id,
  dataClause,
  context = null,
) => {
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

    const existingDoc = await Sys_agentConversation.findOne({ where: { id } });

    if (!existingDoc) {
      throw new NotFoundError(`Record with ID ${id} not found.`);
    }
    const resolvedDataClause = resolveArrayMutationsInClause(
      dataClause,
      existingDoc.getData(),
    );

    const options = { where: { id }, returning: true };

    const updateResult = await Sys_agentConversation.update(
      resolvedDataClause,
      options,
    );
    const rowsCount = updateResult[0];
    let dbDoc = updateResult[1]?.[0] ?? null;

    // If rows were affected but returning didn't provide data, re-fetch
    if (!dbDoc && rowsCount > 0) {
      dbDoc = await Sys_agentConversation.findOne({ where: options.where });
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

module.exports = updateSys_agentConversationById;

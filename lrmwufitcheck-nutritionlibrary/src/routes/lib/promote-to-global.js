// Shared copy-to-global logic used by both the suggestion-approve flow
// (routes/suggestions.js) and the direct admin promote endpoint
// (routes/admin-user-library.js) - one independent global copy, source
// record and its ownership untouched.
const { newUUID } = require("common");

// Copies all active dishLine/presetLine rows from oldParentId to newParentId
// under the given foreign key column name.
async function copyChildLines(ChildModel, fkColumn, oldParentId, newParentId) {
  const lines = await ChildModel.findAll({
    where: { [fkColumn]: oldParentId, isActive: true },
  });
  for (const line of lines) {
    const plain = { ...line.get({ plain: true }) };
    delete plain.id;
    delete plain.createdAt;
    delete plain.updatedAt;
    plain[fkColumn] = newParentId;
    await ChildModel.create({ ...plain, id: newUUID(false) });
  }
  return lines.length;
}

// Creates an independent isGlobal:true copy of `source` (a foodItem/dish/
// presetMeal instance). userId is left as the original owner - ownership
// doesn't move. Returns { copy, copiedLineCount }.
async function createGlobalCopy(entityType, source, { DishLine, PresetLine }) {
  if (source.isGlobal) {
    const err = new Error("Source record is already global");
    err.httpStatus = 400;
    throw err;
  }

  const Model = source.constructor;

  // Capture the source id up front: source.get({plain:true}) returns the
  // SAME underlying dataValues object (not a clone) in this Sequelize
  // version, so mutating copyData.id below would otherwise also mutate
  // source.id out from under us.
  const sourceId = source.id;

  const copyData = { ...source.get({ plain: true }) };
  delete copyData.id;
  delete copyData.createdAt;
  delete copyData.updatedAt;
  copyData.id = newUUID(false);
  copyData.isGlobal = true;
  // userId stays the original owner - ownership doesn't move to the admin

  const copy = await Model.create(copyData);

  let copiedLineCount = 0;
  if (entityType === "dish") {
    copiedLineCount = await copyChildLines(DishLine, "dishId", sourceId, copy.id);
  } else if (entityType === "presetMeal") {
    copiedLineCount = await copyChildLines(
      PresetLine,
      "presetMealId",
      sourceId,
      copy.id,
    );
  }

  return { copy, copiedLineCount };
}

module.exports = { createGlobalCopy, copyChildLines };

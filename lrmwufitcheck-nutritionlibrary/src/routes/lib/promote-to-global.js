// Shared promote-to-global logic used by both the suggestion-approve flow
// (routes/suggestions.js) and the direct admin promote endpoint
// (routes/admin-user-library.js).
//
// Converts the record IN PLACE (source.update({isGlobal:true})) rather than
// creating an independent copy. An earlier version copied the record (new id,
// isGlobal:true, DishLine/PresetLine rows duplicated onto the copy) and left
// the original untouched - that produced two live records with the same
// content (the private original stayed visible in the owner's library
// alongside the new global one) and needed a whole child-line-copying
// mechanism. Converting in place has none of that: the id never changes, so
// mealLog/mealLine snapshots and any other reference to this record keep
// working exactly as before, DishLine/PresetLine rows stay attached to the
// same parent id (nothing to copy), and there is only ever one record.
// Ownership (userId) is intentionally left unchanged - the original creator
// stays the record's owner, it's just visible to everyone now.
async function convertToGlobal(entityType, source) {
  if (source.isGlobal) {
    const err = new Error("Source record is already global");
    err.httpStatus = 400;
    throw err;
  }

  await source.update({ isGlobal: true });
  return { updated: source };
}

module.exports = { convertToGlobal };

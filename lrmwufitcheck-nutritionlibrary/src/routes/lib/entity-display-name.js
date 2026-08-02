// Shared helpers for turning an entityType into user-facing Turkish text -
// used by notification messages in admin-user-library.js and suggestions.js.
const ENTITY_LABELS = {
  foodItem: "besin",
  dish: "yemek",
  presetMeal: "öğün",
};

function entityLabel(entityType) {
  return ENTITY_LABELS[entityType] || "kayıt";
}

// The display-name field differs per entity type.
function entityDisplayName(entityType, plainRecord) {
  if (entityType === "foodItem") return plainRecord.foodName;
  if (entityType === "dish") return plainRecord.dishName;
  if (entityType === "presetMeal") return plainRecord.templateName;
  return "";
}

module.exports = { entityLabel, entityDisplayName };

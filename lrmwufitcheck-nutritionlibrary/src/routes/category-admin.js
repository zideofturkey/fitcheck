// Lightweight route: admin-only category catalog management, mirroring
// src/routes/brand-admin.js exactly. There is no separate "category" table -
// foodCategory/dishCategory/presetCategory are free-text columns on
// foodItem/dish/presetMeal respectively, so "managing categories" means
// bulk-editing that column across every matching row. Plain Sequelize model
// access, no Manager/MCP/gRPC layer.
//
// "entity" selects which column/model is being managed - foodCategory and
// dishCategory/presetCategory are separate value spaces (frontend keeps them
// in separate curated lists: food-category.ts vs dish-category.ts), so
// rename/delete/restore only ever touch one entity at a time.
const express = require("express");
const { Op } = require("sequelize");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

const ENTITY_CONFIG = {
  food: { column: "foodCategory" },
  dish: { column: "dishCategory" },
  preset: { column: "presetCategory" },
};

function getModel(entity) {
  const { FoodItem, Dish, PresetMeal } = require("models");
  if (entity === "food") return FoodItem;
  if (entity === "dish") return Dish;
  if (entity === "preset") return PresetMeal;
  return null;
}

function getDb() {
  return require("dbLayer");
}

function updaterFor(entity) {
  const { updateFoodItemByIdList, updateDishByIdList, updatePresetMealByIdList } =
    getDb();
  if (entity === "food") return updateFoodItemByIdList;
  if (entity === "dish") return updateDishByIdList;
  if (entity === "preset") return updatePresetMealByIdList;
  return null;
}

function resolveEntity(req, res) {
  const entity = req.query.entity || req.body?.entity;
  if (!ENTITY_CONFIG[entity]) {
    res
      .status(400)
      .json({ error: "entity must be one of: food, dish, preset" });
    return null;
  }
  return entity;
}

// GET /v1/admin/categories?entity=food|dish|preset - list distinct category values with how many rows use each
async function listCategories(req, res, next) {
  try {
    const entity = resolveEntity(req, res);
    if (!entity) return;
    const { column } = ENTITY_CONFIG[entity];
    const Model = getModel(entity);

    const rows = await Model.findAll({
      where: { isActive: true, [column]: { [Op.ne]: null } },
      attributes: [column],
    });

    const counts = new Map();
    for (const row of rows) {
      const value = row.getData()[column];
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    const categories = Array.from(counts.entries())
      .map(([category, itemCount]) => ({ category, itemCount }))
      .sort((a, b) => a.category.localeCompare(b.category, "tr"));

    res.json({ status: "OK", entity, categories });
  } catch (err) {
    next(err);
  }
}

// PATCH /v1/admin/categories/rename - { entity, oldName, newName } renames a category across every row that uses it
async function renameCategory(req, res, next) {
  try {
    const entity = resolveEntity(req, res);
    if (!entity) return;
    const { oldName, newName } = req.body || {};
    if (!oldName || !newName) {
      return res
        .status(400)
        .json({ error: "oldName and newName are required" });
    }
    if (oldName === newName) {
      return res.status(400).json({ error: "newName must differ from oldName" });
    }

    const { column } = ENTITY_CONFIG[entity];
    const Model = getModel(entity);
    const updater = updaterFor(entity);

    const matches = await Model.findAll({
      where: { isActive: true, [column]: oldName },
      attributes: ["id"],
    });
    const idList = matches.map((m) => m.id);

    if (idList.length === 0) {
      return res.status(404).json({ error: "No rows found with that category" });
    }

    const updatedIds = await updater(idList, { [column]: newName });

    res.json({
      status: "OK",
      entity,
      oldName,
      newName,
      updatedCount: updatedIds.length,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /v1/admin/categories/:name?entity=food|dish|preset - clears the category (to null) on every row that uses it
async function deleteCategory(req, res, next) {
  try {
    const entity = resolveEntity(req, res);
    if (!entity) return;
    const category = decodeURIComponent(req.params.name);

    const { column } = ENTITY_CONFIG[entity];
    const Model = getModel(entity);
    const updater = updaterFor(entity);

    const matches = await Model.findAll({
      where: { isActive: true, [column]: category },
      attributes: ["id"],
    });
    const idList = matches.map((m) => m.id);

    if (idList.length === 0) {
      return res.status(404).json({ error: "No rows found with that category" });
    }

    const updatedIds = await updater(idList, { [column]: null });

    res.json({
      status: "OK",
      entity,
      category,
      clearedCount: updatedIds.length,
      // Returned so the admin UI can offer an undo, same as brand deletion.
      clearedIds: updatedIds,
    });
  } catch (err) {
    next(err);
  }
}

// POST /v1/admin/categories/restore - { entity, category, ids } writes the category back onto the given rows (undo for deleteCategory)
async function restoreCategory(req, res, next) {
  try {
    const entity = resolveEntity(req, res);
    if (!entity) return;
    const { category, ids } = req.body || {};
    if (!category || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "category and ids (non-empty array) are required" });
    }

    const { column } = ENTITY_CONFIG[entity];
    const updater = updaterFor(entity);
    const updatedIds = await updater(ids, { [column]: category });

    res.json({
      status: "OK",
      entity,
      category,
      restoredCount: updatedIds.length,
    });
  } catch (err) {
    next(err);
  }
}

router.get("/v1/admin/categories", requireAuth, requireAdmin, listCategories);
router.patch(
  "/v1/admin/categories/rename",
  requireAuth,
  requireAdmin,
  renameCategory,
);
router.delete(
  "/v1/admin/categories/:name",
  requireAuth,
  requireAdmin,
  deleteCategory,
);
router.post(
  "/v1/admin/categories/restore",
  requireAuth,
  requireAdmin,
  restoreCategory,
);

module.exports = router;

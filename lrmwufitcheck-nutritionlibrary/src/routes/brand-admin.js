// Lightweight route: admin-only brand catalog management. There is no
// separate "brand" table - brandName is just a free-text column on foodItem,
// so "managing brands" means bulk-editing that column across every matching
// foodItem. Plain Sequelize model access, no Manager/MCP/gRPC layer - mirrors
// src/routes/suggestions.js and src/routes/bulk-import.js.
//
// Renaming/clearing goes through dbLayer's updateFoodItemByIdList rather than
// a raw Sequelize bulk UPDATE, because that's the function the generated
// foodItem Manager itself uses on every write - it keeps Postgres, the
// Elasticsearch index (which the Food Library list/search reads from) and
// the entity cache all in sync in one call. A raw bulk UPDATE would leave
// Elasticsearch (and therefore search/filter results) stale.
const express = require("express");
const { Op } = require("sequelize");
const { newUUID } = require("common");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

function getModels() {
  const { FoodItem, Brand } = require("models");
  return { FoodItem, Brand };
}

function getDb() {
  return require("dbLayer");
}

// GET /v1/admin/brands - list distinct brand names with how many foodItems use each,
// plus any admin-created placeholder brands (itemCount 0) that no foodItem uses yet
async function listBrands(req, res, next) {
  try {
    const { FoodItem, Brand } = getModels();

    const rows = await FoodItem.findAll({
      where: { isActive: true, brandName: { [Op.ne]: null } },
      attributes: ["brandName"],
    });

    const counts = new Map();
    for (const row of rows) {
      const name = row.getData().brandName;
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const placeholders = await Brand.findAll({ attributes: ["brandName"] });
    for (const row of placeholders) {
      const name = row.brandName;
      if (!name || counts.has(name)) continue;
      counts.set(name, 0);
    }

    const brands = Array.from(counts.entries())
      .map(([brandName, itemCount]) => ({ brandName, itemCount }))
      .sort((a, b) => a.brandName.localeCompare(b.brandName, "tr"));

    res.json({ status: "OK", brands });
  } catch (err) {
    next(err);
  }
}

// POST /v1/admin/brands - { brandName } creates a placeholder brand with no
// foodItems attached yet, so it shows up as selectable right away
async function createBrand(req, res, next) {
  try {
    const brandName = (req.body?.brandName || "").trim();
    if (!brandName) {
      return res.status(400).json({ error: "brandName is required" });
    }

    const { FoodItem, Brand } = getModels();

    const [existingItem, existingPlaceholder] = await Promise.all([
      FoodItem.findOne({ where: { isActive: true, brandName } }),
      Brand.findOne({ where: { brandName } }),
    ]);
    if (existingItem || existingPlaceholder) {
      return res.status(409).json({ error: "This brand already exists" });
    }

    const brand = await Brand.create({ id: newUUID(false), brandName });

    res
      .status(201)
      .json({ status: "OK", brand: { brandName: brand.brandName, itemCount: 0 } });
  } catch (err) {
    next(err);
  }
}

// PATCH /v1/admin/brands/rename - { oldName, newName } renames a brand across every foodItem that uses it
async function renameBrand(req, res, next) {
  try {
    const { oldName, newName } = req.body || {};
    if (!oldName || !newName) {
      return res
        .status(400)
        .json({ error: "oldName and newName are required" });
    }
    if (oldName === newName) {
      return res.status(400).json({ error: "newName must differ from oldName" });
    }

    const { FoodItem, Brand } = getModels();
    const { updateFoodItemByIdList } = getDb();

    const matches = await FoodItem.findAll({
      where: { isActive: true, brandName: oldName },
      attributes: ["id"],
    });
    const idList = matches.map((m) => m.id);
    const placeholder = await Brand.findOne({ where: { brandName: oldName } });

    if (idList.length === 0 && !placeholder) {
      return res.status(404).json({ error: "No foodItems found with that brand" });
    }

    let updatedIds = [];
    if (idList.length > 0) {
      updatedIds = await updateFoodItemByIdList(idList, { brandName: newName });
    }
    if (placeholder) {
      await placeholder.update({ brandName: newName });
    }

    res.json({
      status: "OK",
      oldName,
      newName,
      updatedCount: updatedIds.length,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /v1/admin/brands/:name - clears brandName (to null) on every foodItem that uses it (the
// foodItems themselves are kept) and removes the brand's placeholder row if it has one
async function deleteBrand(req, res, next) {
  try {
    const brandName = decodeURIComponent(req.params.name);

    const { FoodItem, Brand } = getModels();
    const { updateFoodItemByIdList } = getDb();

    const matches = await FoodItem.findAll({
      where: { isActive: true, brandName },
      attributes: ["id"],
    });
    const idList = matches.map((m) => m.id);
    const placeholder = await Brand.findOne({ where: { brandName } });

    if (idList.length === 0 && !placeholder) {
      return res.status(404).json({ error: "No foodItems found with that brand" });
    }

    let updatedIds = [];
    if (idList.length > 0) {
      updatedIds = await updateFoodItemByIdList(idList, { brandName: null });
    }
    const wasPlaceholder = !!placeholder && idList.length === 0;
    if (placeholder) {
      await placeholder.destroy();
    }

    res.json({
      status: "OK",
      brandName,
      clearedCount: updatedIds.length,
      // Returned so the admin UI can offer an undo: brand deletion doesn't
      // soft-delete a record (there is no brand row for real brands), it
      // just clears a field on N foodItems - restoring means writing
      // brandName back onto exactly these ids, so the caller needs to hold
      // onto them. Placeholder-only brands (0 foodItems) instead need
      // `wasPlaceholder` so restore knows to recreate the placeholder row.
      clearedIds: updatedIds,
      wasPlaceholder,
    });
  } catch (err) {
    next(err);
  }
}

// POST /v1/admin/brands/restore - { brandName, ids } writes brandName back onto the given foodItems (undo for deleteBrand)
async function restoreBrand(req, res, next) {
  try {
    const { brandName, ids, wasPlaceholder } = req.body || {};
    if (!brandName) {
      return res.status(400).json({ error: "brandName is required" });
    }

    if (wasPlaceholder) {
      const { Brand } = getModels();
      const existing = await Brand.findOne({ where: { brandName } });
      if (!existing) {
        await Brand.create({ id: newUUID(false), brandName });
      }
      return res.json({ status: "OK", brandName, restoredCount: 0 });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "ids (non-empty array) is required unless wasPlaceholder" });
    }

    const { updateFoodItemByIdList } = getDb();
    const updatedIds = await updateFoodItemByIdList(ids, { brandName });

    res.json({
      status: "OK",
      brandName,
      restoredCount: updatedIds.length,
    });
  } catch (err) {
    next(err);
  }
}

router.get("/v1/admin/brands", requireAuth, requireAdmin, listBrands);
router.post("/v1/admin/brands", requireAuth, requireAdmin, createBrand);
router.patch("/v1/admin/brands/rename", requireAuth, requireAdmin, renameBrand);
router.delete("/v1/admin/brands/:name", requireAuth, requireAdmin, deleteBrand);
router.post("/v1/admin/brands/restore", requireAuth, requireAdmin, restoreBrand);

module.exports = router;

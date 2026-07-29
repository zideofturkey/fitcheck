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
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

function getModels() {
  const { FoodItem } = require("models");
  return { FoodItem };
}

function getDb() {
  return require("dbLayer");
}

// GET /v1/admin/brands - list distinct brand names with how many foodItems use each
async function listBrands(req, res, next) {
  try {
    const { FoodItem } = getModels();

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

    const brands = Array.from(counts.entries())
      .map(([brandName, itemCount]) => ({ brandName, itemCount }))
      .sort((a, b) => a.brandName.localeCompare(b.brandName, "tr"));

    res.json({ status: "OK", brands });
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

    const { FoodItem } = getModels();
    const { updateFoodItemByIdList } = getDb();

    const matches = await FoodItem.findAll({
      where: { isActive: true, brandName: oldName },
      attributes: ["id"],
    });
    const idList = matches.map((m) => m.id);

    if (idList.length === 0) {
      return res.status(404).json({ error: "No foodItems found with that brand" });
    }

    const updatedIds = await updateFoodItemByIdList(idList, {
      brandName: newName,
    });

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

// DELETE /v1/admin/brands/:name - clears brandName (to null) on every foodItem that uses it; the foodItems themselves are kept
async function deleteBrand(req, res, next) {
  try {
    const brandName = decodeURIComponent(req.params.name);

    const { FoodItem } = getModels();
    const { updateFoodItemByIdList } = getDb();

    const matches = await FoodItem.findAll({
      where: { isActive: true, brandName },
      attributes: ["id"],
    });
    const idList = matches.map((m) => m.id);

    if (idList.length === 0) {
      return res.status(404).json({ error: "No foodItems found with that brand" });
    }

    const updatedIds = await updateFoodItemByIdList(idList, {
      brandName: null,
    });

    res.json({
      status: "OK",
      brandName,
      clearedCount: updatedIds.length,
    });
  } catch (err) {
    next(err);
  }
}

router.get("/v1/admin/brands", requireAuth, requireAdmin, listBrands);
router.patch("/v1/admin/brands/rename", requireAuth, requireAdmin, renameBrand);
router.delete("/v1/admin/brands/:name", requireAuth, requireAdmin, deleteBrand);

module.exports = router;

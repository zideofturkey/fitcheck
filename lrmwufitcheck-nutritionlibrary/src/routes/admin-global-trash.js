// Lightweight route: admin-only recycle bin for soft-deleted GLOBAL library
// records (foodItem/dish/presetMeal). Plain Sequelize model access, no
// Manager/MCP/gRPC layer - mirrors src/routes/brand-admin.js and
// src/routes/admin-user-library.js.
//
// Every delete on these three objects already goes through the generated
// soft-delete path (isActive:false + _archivedAt:<now>, see
// db-layer/.../utils/deleteXById.js) - nothing new needed there. This route
// only adds the missing read/undo side: list what's in the 14-day window,
// and flip a row back to active. Restoring bypasses updateXByIdList's own
// "isActive:true" precondition (it's built for editing already-active rows),
// so this does a direct Model.update instead - matching how
// routes/lib/promote-to-global.js already writes directly via the model
// without going through dbLayer for its own admin-only mutation.
const express = require("express");
const { Op } = require("sequelize");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

const TRASH_WINDOW_DAYS = 14;

const TYPES = {
  fooditem: {
    getModel: () => require("models").FoodItem,
    dataName: "foodItems",
  },
  dish: {
    getModel: () => require("models").Dish,
    dataName: "dishes",
  },
  presetmeal: {
    getModel: () => require("models").PresetMeal,
    dataName: "presetMeals",
  },
};

function resolveType(req, res) {
  const entry = TYPES[req.params.type];
  if (!entry) {
    res.status(400).json({ error: "Unknown type. Use fooditem, dish, or presetmeal." });
    return null;
  }
  return entry;
}

// GET /v1/admin/library/:type/trash - lists soft-deleted global records
// archived within the last 14 days, most recently deleted first.
async function listTrash(req, res, next) {
  try {
    const entry = resolveType(req, res);
    if (!entry) return;
    const Model = entry.getModel();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRASH_WINDOW_DAYS);

    const rows = await Model.findAll({
      where: {
        isActive: false,
        isGlobal: true,
        _archivedAt: { [Op.gte]: cutoff },
      },
      order: [["_archivedAt", "DESC"]],
    });

    const items = rows.map((r) => r.getData());
    res.json({ status: "OK", [entry.dataName]: items, windowDays: TRASH_WINDOW_DAYS });
  } catch (err) {
    next(err);
  }
}

// POST /v1/admin/library/:type/:id/restore - flips a soft-deleted row back
// to active. Only restores rows still inside the 14-day window, so an item
// that aged out of the visible trash list can't be resurrected by a stale
// direct call either.
async function restoreOne(req, res, next) {
  try {
    const entry = resolveType(req, res);
    if (!entry) return;
    const Model = entry.getModel();
    const { id } = req.params;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRASH_WINDOW_DAYS);

    const [count, rows] = await Model.update(
      { isActive: true, _archivedAt: null },
      {
        where: {
          id,
          isActive: false,
          _archivedAt: { [Op.gte]: cutoff },
        },
        returning: true,
      },
    );

    if (count === 0) {
      return res
        .status(404)
        .json({ error: "Not found in trash (already restored, deleted too long ago, or never existed)" });
    }

    res.json({ status: "OK", restored: rows[0].getData() });
  } catch (err) {
    next(err);
  }
}

// POST /v1/admin/library/:type/restore-bulk - { ids: string[] } restores
// several rows in one call, same 14-day guard as the single-item endpoint.
// Used by the undo toast after a bulk-delete in the admin panel.
async function restoreBulk(req, res, next) {
  try {
    const entry = resolveType(req, res);
    if (!entry) return;
    const Model = entry.getModel();
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids (non-empty array) is required" });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRASH_WINDOW_DAYS);

    const [, rows] = await Model.update(
      { isActive: true, _archivedAt: null },
      {
        where: {
          id: { [Op.in]: ids },
          isActive: false,
          _archivedAt: { [Op.gte]: cutoff },
        },
        returning: true,
      },
    );

    res.json({
      status: "OK",
      restoredCount: rows.length,
      restoredIds: rows.map((r) => r.id),
    });
  } catch (err) {
    next(err);
  }
}

router.get("/v1/admin/library/:type/trash", requireAuth, requireAdmin, listTrash);
router.post(
  "/v1/admin/library/:type/:id/restore",
  requireAuth,
  requireAdmin,
  restoreOne,
);
router.post(
  "/v1/admin/library/:type/restore-bulk",
  requireAuth,
  requireAdmin,
  restoreBulk,
);

module.exports = router;

// Lightweight admin-only route: view a specific user's private library
// (foodItem/dish/presetMeal) and promote one of their records directly to
// global, without going through the Suggestion table. Same plain
// Sequelize + plain Express pattern as routes/suggestions.js.
const express = require("express");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");
const { convertToGlobal } = require("./lib/promote-to-global");
const { notifyUser } = require("./lib/notify-user");
const { entityDisplayName } = require("./lib/entity-display-name");

const router = express.Router();

const ENTITY_TYPES = ["foodItem", "dish", "presetMeal"];

function getModels() {
  const { FoodItem, Dish, DishLine, PresetMeal, PresetLine } = require("models");
  return {
    entityModels: { foodItem: FoodItem, dish: Dish, presetMeal: PresetMeal },
    DishLine,
    PresetLine,
  };
}

// GET /v1/admin/users/:userId/library - all of a user's active, non-global
// foodItem/dish/presetMeal records, each tagged with entityType, newest first.
// isGlobal:false is important here: once a record is promoted (whether via
// this route's own promote endpoint or an approved suggestion), it's a
// global item now, not part of "this user's private library" anymore - the
// record's userId is left unchanged (original creator stays the owner) so
// without this filter it would look like the exact same item was still
// sitting in their private library right next to itself, globally visible.
async function getUserLibrary(req, res, next) {
  try {
    const { entityModels } = getModels();
    const { userId } = req.params;

    const [foodItems, dishes, presetMeals] = await Promise.all([
      entityModels.foodItem.findAll({ where: { userId, isActive: true, isGlobal: false } }),
      entityModels.dish.findAll({ where: { userId, isActive: true, isGlobal: false } }),
      entityModels.presetMeal.findAll({ where: { userId, isActive: true, isGlobal: false } }),
    ]);

    const items = [
      ...foodItems.map((r) => ({ entityType: "foodItem", ...r.get({ plain: true }) })),
      ...dishes.map((r) => ({ entityType: "dish", ...r.get({ plain: true }) })),
      ...presetMeals.map((r) => ({ entityType: "presetMeal", ...r.get({ plain: true }) })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ status: "OK", count: items.length, items });
  } catch (err) {
    next(err);
  }
}

// POST /v1/admin/users/:userId/library/:entityType/:id/promote - flips the
// record to global in place, admin-authorized, no suggestion record created
async function promoteToGlobal(req, res, next) {
  try {
    const { entityType, id, userId } = req.params;
    if (!ENTITY_TYPES.includes(entityType)) {
      return res.status(400).json({
        error: `entityType must be one of: ${ENTITY_TYPES.join(", ")}`,
      });
    }

    const { entityModels } = getModels();
    const Model = entityModels[entityType];
    const source = await Model.findOne({
      where: { id, userId, isActive: true },
    });
    if (!source) {
      return res.status(404).json({ error: "Source record not found" });
    }
    if (source.isGlobal) {
      return res.status(400).json({ error: "Source record is already global" });
    }

    const { updated } = await convertToGlobal(entityType, source);
    const plain = updated.get({ plain: true });

    notifyUser(req, {
      userId,
      title: "Kütüphaneniz güncellendi",
      body: `Kütüphanenizdeki ${entityDisplayName(entityType, plain)} global kütüphaneye eklenmiştir. Teşekkür ederiz.`,
      type: "approved",
    });

    res.json({
      status: "OK",
      globalCopy: plain,
      copiedLineCount: 0,
    });
  } catch (err) {
    next(err);
  }
}

router.get("/v1/admin/users/:userId/library", requireAuth, requireAdmin, getUserLibrary);
router.post(
  "/v1/admin/users/:userId/library/:entityType/:id/promote",
  requireAuth,
  requireAdmin,
  promoteToGlobal,
);

module.exports = router;

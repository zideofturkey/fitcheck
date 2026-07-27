// Lightweight route: user suggestions to promote a private foodItem/dish/
// presetMeal to global, reviewed by an admin. Plain Sequelize model access
// + plain Express routing, no Manager/MCP/gRPC layer - mirrors the pattern
// established in src/routes/food-item-groups.js.
const express = require("express");
const { newUUID } = require("common");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

const ENTITY_TYPES = ["foodItem", "dish", "presetMeal"];

function getModels() {
  const { FoodItem, Dish, DishLine, PresetMeal, PresetLine, Suggestion } =
    require("models");
  return {
    Suggestion,
    entityModels: { foodItem: FoodItem, dish: Dish, presetMeal: PresetMeal },
    DishLine,
    PresetLine,
  };
}

// POST /v1/suggestions - suggest one of your own private records for global promotion
async function createSuggestion(req, res, next) {
  try {
    const { entityType, sourceRecordId } = req.body || {};

    if (!ENTITY_TYPES.includes(entityType)) {
      return res.status(400).json({
        error: `entityType must be one of: ${ENTITY_TYPES.join(", ")}`,
      });
    }
    if (!sourceRecordId) {
      return res.status(400).json({ error: "sourceRecordId is required" });
    }

    const { Suggestion, entityModels } = getModels();
    const Model = entityModels[entityType];

    const record = await Model.findOne({
      where: { id: sourceRecordId, isActive: true },
    });
    if (!record) {
      return res.status(404).json({ error: "Source record not found" });
    }
    if (record.userId !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only suggest your own records" });
    }
    if (record.isGlobal) {
      return res
        .status(400)
        .json({ error: "This record is already global" });
    }

    const suggestion = await Suggestion.create({
      id: newUUID(false),
      userId: req.session.userId,
      entityType,
      sourceRecordId,
      status: "pending",
    });

    res.status(201).json({ status: "OK", suggestion: suggestion.get({ plain: true }) });
  } catch (err) {
    next(err);
  }
}

// GET /v1/suggestions - admins see everyone's (default: pending only, ?status=all for everything);
// regular users see only their own (all statuses unless ?status= given)
async function listSuggestions(req, res, next) {
  try {
    const { Suggestion } = getModels();
    const roleId = req.session?.roleId;
    const roles = Array.isArray(roleId) ? roleId : [roleId];
    const isAdmin = roles.some((r) => ["admin", "superAdmin"].includes(r));

    const where = {};
    if (!isAdmin) {
      where.userId = req.session.userId;
      if (req.query.status) where.status = req.query.status;
    } else {
      if (req.query.status && req.query.status !== "all") {
        where.status = req.query.status;
      } else if (!req.query.status) {
        where.status = "pending";
      }
      // ?status=all -> no status filter
    }

    const suggestions = await Suggestion.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "OK",
      count: suggestions.length,
      suggestions: suggestions.map((s) => s.get({ plain: true })),
    });
  } catch (err) {
    next(err);
  }
}

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

// POST /v1/suggestions/:id/approve - creates an independent global copy of the source record
async function approveSuggestion(req, res, next) {
  try {
    const { Suggestion, entityModels, DishLine, PresetLine } = getModels();
    const suggestion = await Suggestion.findByPk(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ error: "Suggestion not found" });
    }
    if (suggestion.status !== "pending") {
      return res
        .status(400)
        .json({ error: `Suggestion already ${suggestion.status}` });
    }

    const Model = entityModels[suggestion.entityType];
    const source = await Model.findOne({
      where: { id: suggestion.sourceRecordId, isActive: true },
    });
    if (!source) {
      return res.status(404).json({ error: "Source record no longer exists" });
    }
    if (source.isGlobal) {
      return res
        .status(400)
        .json({ error: "Source record is already global" });
    }

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
    if (suggestion.entityType === "dish") {
      copiedLineCount = await copyChildLines(DishLine, "dishId", sourceId, copy.id);
    } else if (suggestion.entityType === "presetMeal") {
      copiedLineCount = await copyChildLines(
        PresetLine,
        "presetMealId",
        sourceId,
        copy.id,
      );
    }

    await suggestion.update({
      status: "approved",
      reviewNote: req.body?.reviewNote ?? null,
      reviewedBy: req.session.userId,
      reviewedAt: new Date(),
    });

    res.json({
      status: "OK",
      suggestion: suggestion.get({ plain: true }),
      globalCopy: copy.get({ plain: true }),
      copiedLineCount,
    });
  } catch (err) {
    next(err);
  }
}

// POST /v1/suggestions/:id/reject - marks rejected, touches no records
async function rejectSuggestion(req, res, next) {
  try {
    const { Suggestion } = getModels();
    const suggestion = await Suggestion.findByPk(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ error: "Suggestion not found" });
    }
    if (suggestion.status !== "pending") {
      return res
        .status(400)
        .json({ error: `Suggestion already ${suggestion.status}` });
    }

    await suggestion.update({
      status: "rejected",
      reviewNote: req.body?.reviewNote ?? null,
      reviewedBy: req.session.userId,
      reviewedAt: new Date(),
    });

    res.json({ status: "OK", suggestion: suggestion.get({ plain: true }) });
  } catch (err) {
    next(err);
  }
}

router.post("/v1/suggestions", requireAuth, createSuggestion);
router.get("/v1/suggestions", requireAuth, listSuggestions);
router.post("/v1/suggestions/:id/approve", requireAuth, requireAdmin, approveSuggestion);
router.post("/v1/suggestions/:id/reject", requireAuth, requireAdmin, rejectSuggestion);

module.exports = router;

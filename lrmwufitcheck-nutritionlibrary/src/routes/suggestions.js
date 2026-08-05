// Lightweight route: user suggestions to promote a private foodItem/dish/
// presetMeal to global, reviewed by an admin. Plain Sequelize model access
// + plain Express routing, no Manager/MCP/gRPC layer - mirrors the pattern
// established in src/routes/food-item-groups.js.
const express = require("express");
const { newUUID } = require("common");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");
const { convertToGlobal } = require("./lib/promote-to-global");
const { notifyUser } = require("./lib/notify-user");
const { entityLabel, entityDisplayName } = require("./lib/entity-display-name");

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

    // A user can only ever have one suggestion per source record, regardless
    // of its status - resubmitting a pending one just duplicates the review
    // queue entry, and resubmitting an approved one is what was producing
    // two live global copies of the same item before promote-to-global
    // switched to converting in place. Checked before the isGlobal check
    // below so an already-approved suggestion gets its specific Turkish
    // message instead of the generic "already global" one - once approved,
    // record.isGlobal is true too, and that check would otherwise win first.
    const existing = await Suggestion.findOne({
      where: { userId: req.session.userId, entityType, sourceRecordId },
    });
    if (existing) {
      const label = entityLabel(entityType);
      const message =
        existing.status === "approved"
          ? `Bu ${label} zaten global kütüphaneye eklenmiştir.`
          : `Bu ${label} için daha önce bir öneride bulundunuz.`;
      return res.status(409).json({ error: message, existingStatus: existing.status });
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

// Fetches the real foodItem/dish/presetMeal record a suggestion points at,
// so the admin panel can show what it's actually approving instead of a
// bare id. Dish/presetMeal also include their active lines (same pattern
// as copyChildLines below, but reading rather than copying).
async function fetchSourceDetail(entityType, sourceRecordId) {
  const { entityModels, DishLine, PresetLine } = getModels();
  const Model = entityModels[entityType];
  const record = await Model.findOne({
    where: { id: sourceRecordId, isActive: true },
  });
  if (!record) return null;

  const plain = record.get({ plain: true });

  if (entityType === "foodItem") {
    return {
      foodName: plain.foodName,
      caloriePer100g: plain.caloriePer100g,
      proteinPer100g: plain.proteinPer100g,
      carbohydratePer100g: plain.carbohydratePer100g,
      fatPer100g: plain.fatPer100g,
      sugarPer100g: plain.sugarPer100g,
      fiberPer100g: plain.fiberPer100g,
      brandName: plain.brandName,
    };
  }

  if (entityType === "dish") {
    const lines = await DishLine.findAll({
      where: { dishId: sourceRecordId, isActive: true },
    });
    return {
      dishName: plain.dishName,
      descriptionText: plain.descriptionText,
      totalCalories: plain.totalCalories,
      totalProtein: plain.totalProtein,
      totalCarbohydrates: plain.totalCarbohydrates,
      totalFat: plain.totalFat,
      totalSugar: plain.totalSugar,
      totalFiber: plain.totalFiber,
      totalGramWeight: plain.totalGramWeight,
      lines: lines.map((l) => {
        const lp = l.get({ plain: true });
        return {
          lineFoodName: lp.lineFoodName,
          gramAmount: lp.gramAmount,
          lineCalories: lp.lineCalories,
          lineProtein: lp.lineProtein,
          lineCarbohydrates: lp.lineCarbohydrates,
          lineFat: lp.lineFat,
          lineSugar: lp.lineSugar,
          lineFiber: lp.lineFiber,
        };
      }),
    };
  }

  if (entityType === "presetMeal") {
    const lines = await PresetLine.findAll({
      where: { presetMealId: sourceRecordId, isActive: true },
    });
    return {
      templateName: plain.templateName,
      descriptionText: plain.descriptionText,
      totalCalories: plain.totalCalories,
      totalProtein: plain.totalProtein,
      totalCarbohydrates: plain.totalCarbohydrates,
      totalFat: plain.totalFat,
      totalSugar: plain.totalSugar,
      totalFiber: plain.totalFiber,
      lines: lines.map((l) => {
        const lp = l.get({ plain: true });
        return {
          lineFoodName: lp.lineFoodName,
          gramAmount: lp.gramAmount,
          lineCalories: lp.lineCalories,
          lineProtein: lp.lineProtein,
          lineCarbohydrates: lp.lineCarbohydrates,
          lineFat: lp.lineFat,
          lineSugar: lp.lineSugar,
          lineFiber: lp.lineFiber,
        };
      }),
    };
  }

  return null;
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
      if (req.query.userId) where.userId = req.query.userId;
    }

    const suggestions = await Suggestion.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const enriched = await Promise.all(
      suggestions.map(async (s) => {
        const plain = s.get({ plain: true });
        plain.sourceDetail = await fetchSourceDetail(
          plain.entityType,
          plain.sourceRecordId,
        );
        return plain;
      }),
    );

    res.json({
      status: "OK",
      count: enriched.length,
      suggestions: enriched,
    });
  } catch (err) {
    next(err);
  }
}

// POST /v1/suggestions/:id/approve - flips the source record to global in place
async function approveSuggestion(req, res, next) {
  try {
    const { Suggestion, entityModels } = getModels();
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

    const { updated } = await convertToGlobal(suggestion.entityType, source);
    const plain = updated.get({ plain: true });

    await suggestion.update({
      status: "approved",
      reviewNote: req.body?.reviewNote ?? null,
      reviewedBy: req.session.userId,
      reviewedAt: new Date(),
    });

    notifyUser(req, {
      userId: suggestion.userId,
      title: "Öneriniz onaylandı",
      body: `Önerdiğiniz ${entityDisplayName(suggestion.entityType, plain)} global kütüphaneye eklenmiştir. Teşekkür ederiz.`,
      type: "approved",
    });

    res.json({
      status: "OK",
      suggestion: suggestion.get({ plain: true }),
      globalCopy: plain,
      copiedLineCount: 0,
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

    const reviewNote = req.body?.reviewNote ?? null;

    await suggestion.update({
      status: "rejected",
      reviewNote,
      reviewedBy: req.session.userId,
      reviewedAt: new Date(),
    });

    const sourceDetail = await fetchSourceDetail(
      suggestion.entityType,
      suggestion.sourceRecordId,
    );
    const itemName = sourceDetail
      ? entityDisplayName(suggestion.entityType, sourceDetail)
      : entityLabel(suggestion.entityType);

    notifyUser(req, {
      userId: suggestion.userId,
      title: "Öneriniz reddedildi",
      body:
        `Önerdiğiniz ${itemName} için global kütüphane talebiniz reddedilmiştir.` +
        (reviewNote ? ` Not: ${reviewNote}` : ""),
      type: "rejected",
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

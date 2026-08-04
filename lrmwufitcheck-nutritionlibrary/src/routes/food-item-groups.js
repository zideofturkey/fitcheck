// Lightweight route: GET /v1/food-items/grouped
// Groups the caller's foodItems by baseName (ingredient brand-variant
// grouping). Items sharing a baseName are variants of the same ingredient;
// items without a baseName each form their own singleton group.
//
// Deliberately NOT built as a Mindbricks Manager - plain Sequelize query +
// plain grouping logic in one file, reusing the same auth/session flow the
// heavy REST controllers use (src/routes/middleware/require-auth.js).
const express = require("express");
const requireAuth = require("./middleware/require-auth");

const router = express.Router();

async function getGroupedFoodItems(req, res, next) {
  try {
    const { FoodItem } = require("models");
    const { Op } = require("sequelize");

    const items = await FoodItem.findAll({
      where: {
        isActive: true,
        [Op.or]: [{ userId: req.session.userId }, { isGlobal: true }],
      },
      order: [["baseName", "ASC"], ["createdAt", "ASC"]],
    });

    const groupsByBaseName = new Map();
    const singletons = [];

    for (const row of items) {
      const item = row.getData();
      if (item.baseName) {
        if (!groupsByBaseName.has(item.baseName)) {
          groupsByBaseName.set(item.baseName, []);
        }
        groupsByBaseName.get(item.baseName).push(item);
      } else {
        singletons.push({ baseName: null, items: [item] });
      }
    }

    const groups = [
      ...Array.from(groupsByBaseName.entries()).map(([baseName, groupItems]) => ({
        baseName,
        items: groupItems,
      })),
      ...singletons,
    ];

    res.json({
      status: "OK",
      groupCount: groups.length,
      itemCount: items.length,
      groups,
    });
  } catch (err) {
    next(err);
  }
}

router.get("/v1/food-items/grouped", requireAuth, getGroupedFoodItems);
router.get("/food-items/grouped", requireAuth, getGroupedFoodItems);

module.exports = router;

// Lightweight route: admin-only bulk import of global foodItem/dish/
// presetMeal records from a plain JSON array (client parses CSV/JSON
// themselves and posts a `rows` array). Plain Sequelize model access, no
// Manager/MCP/gRPC layer - mirrors src/routes/suggestions.js.
//
// Reuses the same nutrition math and rollup functions the heavy Manager
// code uses (LIB.recalculateDishTotals / LIB.recalculatePresetTotals,
// already registered globally at startup) instead of re-deriving them.
const express = require("express");
const { Op } = require("sequelize");
const { newUUID } = require("common");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

const round2 = (v) => Math.round(v * 100) / 100;

function getModels() {
  const { FoodItem, Dish, DishLine, PresetMeal, PresetLine } = require("models");
  return { FoodItem, Dish, DishLine, PresetMeal, PresetLine };
}

async function resolveFoodItem(FoodItem, ref) {
  if (ref.foodItemId) {
    return FoodItem.findOne({
      where: { id: ref.foodItemId, isGlobal: true, isActive: true },
    });
  }
  if (ref.foodName) {
    return FoodItem.findOne({
      where: { foodName: { [Op.iLike]: ref.foodName }, isGlobal: true, isActive: true },
    });
  }
  return null;
}

async function resolveDish(Dish, ref) {
  if (ref.dishId) {
    return Dish.findOne({ where: { id: ref.dishId, isGlobal: true, isActive: true } });
  }
  if (ref.dishName) {
    return Dish.findOne({
      where: { dishName: { [Op.iLike]: ref.dishName }, isGlobal: true, isActive: true },
    });
  }
  return null;
}

// --- type: "ingredient" -------------------------------------------------

async function processIngredient(row, index, adminUserId) {
  const { FoodItem } = getModels();
  try {
    const {
      foodName, baseName, brand,
      caloriePer100g, proteinPer100g, carbohydratePer100g, fatPer100g, sugarPer100g, fiberPer100g,
      foodCategory,
    } = row;

    if (!foodName) {
      return { row: index, type: "ingredient", status: "error", message: "foodName is required" };
    }

    // Same brand-variant chaining as create-fooditem-api.js, scoped to the
    // global library (isGlobal:true) instead of a single user's records.
    let parentIngredientId = null;
    if (baseName) {
      const canonicalParent = await FoodItem.findOne({
        where: { baseName, parentIngredientId: null, isGlobal: true, isActive: true },
      });
      if (canonicalParent) parentIngredientId = canonicalParent.id;
    }

    const created = await FoodItem.create({
      id: newUUID(false),
      userId: adminUserId,
      foodName,
      caloriePer100g: caloriePer100g ?? 0,
      proteinPer100g: proteinPer100g ?? 0,
      carbohydratePer100g: carbohydratePer100g ?? 0,
      fatPer100g: fatPer100g ?? 0,
      sugarPer100g: sugarPer100g ?? 0,
      fiberPer100g: fiberPer100g ?? 0,
      brandName: brand || null,
      baseName: baseName || null,
      parentIngredientId,
      foodCategory: foodCategory || null,
      creationSource: "manualEntry",
      isGlobal: true,
      isActive: true,
    });

    return { row: index, type: "ingredient", status: "success", createdId: created.id };
  } catch (err) {
    return { row: index, type: "ingredient", status: "error", message: err.message };
  }
}

// --- type: "dish" --------------------------------------------------------

async function processDish(row, index, adminUserId) {
  const { Dish, DishLine, FoodItem } = getModels();
  const { dishName, descriptionText, ingredients } = row;

  if (!dishName) {
    return { row: index, type: "dish", status: "error", message: "dishName is required" };
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return { row: index, type: "dish", status: "error", message: "ingredients must be a non-empty array" };
  }

  let dish;
  try {
    dish = await Dish.create({
      id: newUUID(false),
      userId: adminUserId,
      dishName,
      descriptionText: descriptionText || null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
      totalGramWeight: 0,
      isGlobal: true,
      isActive: true,
    });
  } catch (err) {
    return { row: index, type: "dish", status: "error", message: `Failed to create dish: ${err.message}` };
  }

  const unresolved = [];
  let resolvedCount = 0;
  for (const ing of ingredients) {
    try {
      const gramAmount = ing.gramAmount;
      const label = ing.foodName || ing.foodItemId || "(ingredient)";
      if (gramAmount == null) {
        unresolved.push(`${label}: gramAmount missing`);
        continue;
      }
      const foodItem = await resolveFoodItem(FoodItem, ing);
      if (!foodItem) {
        unresolved.push(`${label}: not found in global library`);
        continue;
      }

      await DishLine.create({
        id: newUUID(false),
        dishId: dish.id,
        foodItemId: foodItem.id,
        lineFoodName: foodItem.foodName,
        gramAmount,
        lineCalories: round2((foodItem.caloriePer100g * gramAmount) / 100),
        lineProtein: round2((foodItem.proteinPer100g * gramAmount) / 100),
        lineCarbohydrates: round2((foodItem.carbohydratePer100g * gramAmount) / 100),
        lineFat: round2((foodItem.fatPer100g * gramAmount) / 100),
        lineSugar: round2((foodItem.sugarPer100g * gramAmount) / 100),
        lineFiber: round2((foodItem.fiberPer100g * gramAmount) / 100),
        isActive: true,
      });
      resolvedCount++;
    } catch (err) {
      unresolved.push(`${ing.foodName || ing.foodItemId}: ${err.message}`);
    }
  }

  if (resolvedCount === 0) {
    await dish.destroy();
    return {
      row: index,
      type: "dish",
      status: "error",
      message: `No ingredients could be resolved: ${unresolved.join("; ")}`,
    };
  }

  await global.LIB.recalculateDishTotals(dish.id);

  if (unresolved.length > 0) {
    return {
      row: index,
      type: "dish",
      status: "partial",
      createdId: dish.id,
      message: `Unresolved ingredients: ${unresolved.join("; ")}`,
    };
  }
  return { row: index, type: "dish", status: "success", createdId: dish.id };
}

// --- type: "meal_template" ------------------------------------------------

async function processMealTemplate(row, index, adminUserId) {
  const { PresetMeal, PresetLine, FoodItem, Dish } = getModels();
  const { presetName, descriptionText, items } = row;

  if (!presetName) {
    return { row: index, type: "meal_template", status: "error", message: "presetName is required" };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { row: index, type: "meal_template", status: "error", message: "items must be a non-empty array" };
  }

  let presetMeal;
  try {
    presetMeal = await PresetMeal.create({
      id: newUUID(false),
      userId: adminUserId,
      templateName: presetName,
      descriptionText: descriptionText || null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
      isGlobal: true,
      isActive: true,
    });
  } catch (err) {
    return { row: index, type: "meal_template", status: "error", message: `Failed to create preset meal: ${err.message}` };
  }

  const unresolved = [];
  let resolvedCount = 0;
  for (const item of items) {
    const label = item.dishName || item.foodName || item.dishId || item.foodItemId || "(item)";
    try {
      const hasDish = !!(item.dishId || item.dishName);
      const hasFood = !!(item.foodItemId || item.foodName);
      if (hasDish === hasFood) {
        unresolved.push(`${label}: must reference exactly one of dish or foodItem`);
        continue;
      }
      const gramAmount = item.gramAmount;
      if (gramAmount == null) {
        unresolved.push(`${label}: gramAmount missing`);
        continue;
      }

      if (hasFood) {
        const foodItem = await resolveFoodItem(FoodItem, item);
        if (!foodItem) {
          unresolved.push(`${label}: ingredient not found in global library`);
          continue;
        }
        await PresetLine.create({
          id: newUUID(false),
          presetMealId: presetMeal.id,
          foodItemId: foodItem.id,
          dishId: null,
          lineFoodName: foodItem.foodName,
          gramAmount,
          lineCalories: round2((foodItem.caloriePer100g * gramAmount) / 100),
          lineProtein: round2((foodItem.proteinPer100g * gramAmount) / 100),
          lineCarbohydrates: round2((foodItem.carbohydratePer100g * gramAmount) / 100),
          lineFat: round2((foodItem.fatPer100g * gramAmount) / 100),
          lineSugar: round2((foodItem.sugarPer100g * gramAmount) / 100),
          lineFiber: round2((foodItem.fiberPer100g * gramAmount) / 100),
          isActive: true,
        });
      } else {
        const dish = await resolveDish(Dish, item);
        if (!dish) {
          unresolved.push(`${label}: dish not found in global library`);
          continue;
        }
        const factor = dish.totalGramWeight > 0 ? gramAmount / dish.totalGramWeight : 0;
        await PresetLine.create({
          id: newUUID(false),
          presetMealId: presetMeal.id,
          foodItemId: null,
          dishId: dish.id,
          lineFoodName: dish.dishName,
          gramAmount,
          lineCalories: round2(dish.totalCalories * factor),
          lineProtein: round2(dish.totalProtein * factor),
          lineCarbohydrates: round2(dish.totalCarbohydrates * factor),
          lineFat: round2(dish.totalFat * factor),
          lineSugar: round2(dish.totalSugar * factor),
          lineFiber: round2(dish.totalFiber * factor),
          isActive: true,
        });
      }
      resolvedCount++;
    } catch (err) {
      unresolved.push(`${label}: ${err.message}`);
    }
  }

  if (resolvedCount === 0) {
    await presetMeal.destroy();
    return {
      row: index,
      type: "meal_template",
      status: "error",
      message: `No items could be resolved: ${unresolved.join("; ")}`,
    };
  }

  await global.LIB.recalculatePresetTotals(presetMeal.id);

  if (unresolved.length > 0) {
    return {
      row: index,
      type: "meal_template",
      status: "partial",
      createdId: presetMeal.id,
      message: `Unresolved items: ${unresolved.join("; ")}`,
    };
  }
  return { row: index, type: "meal_template", status: "success", createdId: presetMeal.id };
}

// --- POST /v1/bulk-import -------------------------------------------------

router.post("/v1/bulk-import", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const rows = req.body?.rows;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "Body must include a `rows` array" });
    }

    const adminUserId = req.session.userId;
    const indexed = rows.map((row, index) => ({ row, index }));
    const KNOWN_TYPES = ["ingredient", "dish", "meal_template"];

    const results = [];

    for (const { row, index } of indexed.filter((r) => r.row?.type === "ingredient")) {
      results.push(await processIngredient(row, index, adminUserId));
    }
    for (const { row, index } of indexed.filter((r) => r.row?.type === "dish")) {
      results.push(await processDish(row, index, adminUserId));
    }
    for (const { row, index } of indexed.filter((r) => r.row?.type === "meal_template")) {
      results.push(await processMealTemplate(row, index, adminUserId));
    }
    for (const { row, index } of indexed.filter((r) => !KNOWN_TYPES.includes(r.row?.type))) {
      results.push({
        row: index,
        type: row?.type,
        status: "error",
        message: `Unknown type: ${row?.type}`,
      });
    }

    results.sort((a, b) => a.row - b.row);

    const summary = {
      total: rows.length,
      success: results.filter((r) => r.status === "success").length,
      partial: results.filter((r) => r.status === "partial").length,
      error: results.filter((r) => r.status === "error").length,
    };

    res.json({ status: "OK", summary, results });
  } catch (err) {
    next(err);
  }
});

// --- GET /v1/bulk-import/template -----------------------------------------

router.get("/v1/bulk-import/template", requireAuth, requireAdmin, (req, res) => {
  // ingredients/items columns hold a JSON array as a single CSV cell, since
  // CSV has no native nested-array representation. Build your `rows` JSON
  // array for POST /v1/bulk-import from data shaped like this, not by
  // posting the raw CSV.
  const lines = [
    "type,foodName,baseName,brand,caloriePer100g,proteinPer100g,carbohydratePer100g,fatPer100g,sugarPer100g,fiberPer100g,foodCategory,dishName,descriptionText,ingredients,presetName,items",
    'ingredient,Yogurt - Brand A,Yogurt,Brand A,61,3.5,4.7,3.3,4.7,0,Dairy,,,,,',
    'dish,,,,,,,,,,,Chicken Rice Bowl,A simple bowl,"[{""foodName"":""Chicken Breast"",""gramAmount"":150},{""foodName"":""White Rice"",""gramAmount"":200}]",,',
    'meal_template,,,,,,,,,,,,,,Breakfast Combo,"[{""dishName"":""Chicken Rice Bowl"",""gramAmount"":250},{""foodName"":""Egg"",""gramAmount"":100}]"',
  ];

  res.setHeader("Content-Type", "text/csv");
  res.send(lines.join("\n"));
});

module.exports = router;

import type { TFunction } from "i18next";

// Values are stored as-is on dish.dishCategory (backend-compatible) — only
// the displayed label is translated, via dishes.categories.<key>. Mirrors
// the pattern established for foodItem in @/lib/food-category.ts.
export const DISH_CATEGORIES = [
  "Breakfast",
  "Soup",
  "MainCourse",
  "Salad",
  "Snack",
  "Dessert",
  "Beverage",
  "Other",
];

const CATEGORY_KEYS: Record<string, string> = {
  Breakfast: "breakfast",
  Soup: "soup",
  MainCourse: "mainCourse",
  Salad: "salad",
  Snack: "snack",
  Dessert: "dessert",
  Beverage: "beverage",
  Other: "other",
};

export function dishCategoryLabel(
  t: TFunction,
  value: string | undefined | null,
) {
  if (!value) return value ?? "";
  const key = CATEGORY_KEYS[value];
  return key ? t(`dishes.categories.${key}`) : value;
}

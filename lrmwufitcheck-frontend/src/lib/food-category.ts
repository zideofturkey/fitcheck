import type { TFunction } from "i18next";

// Values are stored as-is on foodItem.foodCategory (backend-compatible) —
// only the displayed label is translated, via foodLibrary.categories.<key>.
export const CATEGORIES = [
  "Meat",
  "Dairy",
  "Bakery",
  "Vegetable",
  "Fruit",
  "Grain",
  "Sauce",
  "Snack",
  "Beverage",
  "Other",
];

const CATEGORY_KEYS: Record<string, string> = {
  Meat: "meat",
  Dairy: "dairy",
  Bakery: "bakery",
  Vegetable: "vegetable",
  Fruit: "fruit",
  Grain: "grain",
  Sauce: "sauce",
  Snack: "snack",
  Beverage: "beverage",
  Other: "other",
};

export function categoryLabel(t: TFunction, value: string | undefined | null) {
  if (!value) return value ?? "";
  const key = CATEGORY_KEYS[value];
  return key ? t(`foodLibrary.categories.${key}`) : value;
}

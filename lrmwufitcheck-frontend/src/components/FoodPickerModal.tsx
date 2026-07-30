import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Loader,
  Search,
  X,
  BookOpen,
  ClipboardList,
  PencilLine,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListFoodItems,
  useListPresetMeals,
  useListPresetLines,
} from "@/hooks/api/use-nutritionlibrary";
import { useListDishes, useListDishLines } from "@/hooks/api/use-dish";
import type {
  NutritionlibraryFoodItem,
  NutritionlibraryPresetMeal,
  NutritionlibraryPresetLine,
} from "@/types/api";
import type { Dish } from "@/services/api/dish-api";

export type PickedFoodLine = {
  itemName: string;
  consumedGrams: number;
  itemCalories: number;
  itemProtein: number;
  itemCarbohydrates: number;
  itemFat: number;
  itemSugar: number;
  itemFiber: number;
  lineSource: "foodLibrary" | "presetTemplate" | "dishTemplate" | "manualEntry";
  sourceFoodItemId?: string;
  sourcePresetMealId?: string;
  sourceDishId?: string;
};

interface FoodPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with one or more lines ready to append to the meal log. */
  onPick: (lines: PickedFoodLine[]) => void;
  /** Open the existing manual entry form. */
  onManualEntry: () => void;
}

type Tab = "library" | "presets" | "dishes";

const round = (n: number) => +n.toFixed(1);

export default function FoodPickerModal({
  open,
  onClose,
  onPick,
  onManualEntry,
}: FoodPickerModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("library");
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] =
    useState<NutritionlibraryFoodItem | null>(null);
  const [grams, setGrams] = useState<number>(100);
  const [selectedPreset, setSelectedPreset] =
    useState<NutritionlibraryPresetMeal | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const { data: foodData, isLoading: foodLoading } = useListFoodItems({
    searchTerm: search || undefined,
    pageRowCount: 20,
  });
  const { data: presetData, isLoading: presetsLoading } = useListPresetMeals({
    searchTerm: search || undefined,
    pageRowCount: 20,
  });
  const { data: dishData, isLoading: dishesLoading } = useListDishes({
    dishName: search || undefined,
    pageRowCount: 20,
  });
  // Fetch lines for the selected preset meal so we can snapshot them.
  const { data: presetLinesData } = useListPresetLines(
    selectedPreset?.id ?? null,
  );
  const { data: dishLinesData } = useListDishLines(selectedDish?.id ?? null);

  if (!open) return null;

  const close = () => {
    setSelectedFood(null);
    setSelectedPreset(null);
    setSelectedDish(null);
    setGrams(100);
    setSearch("");
    onClose();
  };

  const gramValue = grams > 0 ? grams : 100;
  const foodPreview = selectedFood
    ? {
        calories: Math.round(
          (selectedFood.caloriePer100g / 100) * gramValue,
        ),
        protein: round((selectedFood.proteinPer100g / 100) * gramValue),
        carbs: round((selectedFood.carbohydratePer100g / 100) * gramValue),
        fat: round((selectedFood.fatPer100g / 100) * gramValue),
        sugar: round((selectedFood.sugarPer100g / 100) * gramValue),
        fiber: round((selectedFood.fiberPer100g / 100) * gramValue),
      }
    : null;

  const confirmFood = () => {
    if (!selectedFood || !foodPreview) return;
    onPick([
      {
        itemName: selectedFood.foodName,
        consumedGrams: gramValue,
        itemCalories: foodPreview.calories,
        itemProtein: foodPreview.protein,
        itemCarbohydrates: foodPreview.carbs,
        itemFat: foodPreview.fat,
        itemSugar: foodPreview.sugar,
        itemFiber: foodPreview.fiber,
        lineSource: "foodLibrary",
        sourceFoodItemId: selectedFood.id,
      },
    ]);
    close();
  };

  const confirmPreset = () => {
    if (!selectedPreset) return;
    const lines: NutritionlibraryPresetLine[] =
      presetLinesData?.presetLines ?? [];
    // The preset detail fetch may not include lines inline; fall back to the
    // list-shaped key if present.
    const picked: PickedFoodLine[] = lines.map((l) => ({
      itemName: l.lineFoodName,
      consumedGrams: l.gramAmount,
      itemCalories: l.lineCalories,
      itemProtein: l.lineProtein,
      itemCarbohydrates: l.lineCarbohydrates,
      itemFat: l.lineFat,
      itemSugar: l.lineSugar,
      itemFiber: l.lineFiber,
      lineSource: "presetTemplate",
      sourcePresetMealId: selectedPreset.id,
    }));
    if (picked.length > 0) {
      onPick(picked);
    }
    close();
  };

  const confirmDish = () => {
    if (!selectedDish) return;
    const lines = dishLinesData?.dishLines ?? [];
    const picked: PickedFoodLine[] = lines.map((l) => ({
      itemName: l.lineFoodName,
      consumedGrams: l.gramAmount,
      itemCalories: l.lineCalories,
      itemProtein: l.lineProtein,
      itemCarbohydrates: l.lineCarbohydrates ?? 0,
      itemFat: l.lineFat ?? 0,
      itemSugar: l.lineSugar ?? 0,
      itemFiber: l.lineFiber ?? 0,
      lineSource: "dishTemplate",
      sourceDishId: selectedDish.id,
    }));
    if (picked.length > 0) {
      onPick(picked);
    }
    close();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/30"
        onClick={close}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {t("foodPickerModal.title")}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1.5 hover:bg-muted"
            aria-label={t("foodPickerModal.closeAria")}
            title={t("foodPickerModal.closeAria")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-border bg-muted/30">
          <button
            type="button"
            onClick={() => {
              setTab("library");
              setSelectedPreset(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "library"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t("foodPickerModal.foodLibraryTab")}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("dishes");
              setSelectedFood(null);
              setSelectedPreset(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "dishes"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            {t("foodPickerModal.dishesTab")}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("presets");
              setSelectedFood(null);
              setSelectedDish(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "presets"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {t("foodPickerModal.presetMealsTab")}
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                tab === "library"
                  ? t("foodPickerModal.searchFoods")
                  : tab === "dishes"
                    ? t("foodPickerModal.searchDishes")
                    : t("foodPickerModal.searchPresets")
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tab === "library" &&
            (foodLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                {t("foodPickerModal.loading")}
              </div>
            ) : (foodData?.foodItems ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("foodPickerModal.noFoodsFound")}
              </p>
            ) : (
              (foodData?.foodItems ?? []).map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => {
                      setSelectedFood(food);
                      setGrams(100);
                    }}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium">{food.foodName}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.caloriePer100g} kcal · {food.proteinPer100g}g protein
                      / 100g
                    </p>
                  </button>
                );
              })
            ))}

          {tab === "presets" &&
            (presetsLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                {t("foodPickerModal.loading")}
              </div>
            ) : (presetData?.presetMeals ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("foodPickerModal.noPresetsFound")}
              </p>
            ) : (
              (presetData?.presetMeals ?? []).map((pm) => {
                const isSelected = selectedPreset?.id === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPreset(pm)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium">{pm.templateName}</p>
                    <p className="text-xs text-muted-foreground">
                      {pm.totalCalories} kcal · {pm.totalProtein}g protein
                    </p>
                  </button>
                );
              })
            ))}

          {tab === "dishes" &&
            (dishesLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                {t("foodPickerModal.loading")}
              </div>
            ) : (dishData?.dishes ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("foodPickerModal.noDishesFound")}
              </p>
            ) : (
              (dishData?.dishes ?? []).map((dish) => {
                const isSelected = selectedDish?.id === dish.id;
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => setSelectedDish(dish)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium">{dish.dishName}</p>
                    <p className="text-xs text-muted-foreground">
                      {dish.totalCalories} kcal · {dish.totalProtein}g protein
                    </p>
                  </button>
                );
              })
            ))}
        </div>

        {/* Gram + preview (library) */}
        {tab === "library" && selectedFood && foodPreview && (
          <div className="border-t border-border p-4 space-y-3 bg-muted/30">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("foodPickerModal.gramAmount")}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  value={grams}
                  onChange={(e) => setGrams(Number(e.target.value) || 0)}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  g
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                [t("foodPickerModal.calories"), `${foodPreview.calories} kcal`],
                [t("foodPickerModal.protein"), `${foodPreview.protein} g`],
                [t("foodPickerModal.carbs"), `${foodPreview.carbs} g`],
                [t("foodPickerModal.fat"), `${foodPreview.fat} g`],
                [t("foodPickerModal.sugar"), `${foodPreview.sugar} g`],
                [t("foodPickerModal.fiber"), `${foodPreview.fiber} g`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md bg-card border border-border p-2"
                >
                  <p className="text-muted-foreground">{label}</p>
                  <p className="font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={grams <= 0}
              onClick={confirmFood}
            >
              {t("foodPickerModal.addGrams", { grams: gramValue })}
            </Button>
          </div>
        )}

        {/* Confirm preset */}
        {tab === "presets" && selectedPreset && (
          <div className="border-t border-border p-4 space-y-3 bg-muted/30">
            <div className="rounded-md bg-card border border-border p-3 text-sm">
              <p className="font-medium text-foreground">
                {selectedPreset.templateName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("foodPickerModal.allFoodsWillBeAdded", {
                  calories: selectedPreset.totalCalories,
                })}
              </p>
            </div>
            <Button type="button" className="w-full" onClick={confirmPreset}>
              {t("foodPickerModal.addMeal")}
            </Button>
          </div>
        )}

        {/* Confirm dish */}
        {tab === "dishes" && selectedDish && (
          <div className="border-t border-border p-4 space-y-3 bg-muted/30">
            <div className="rounded-md bg-card border border-border p-3 text-sm">
              <p className="font-medium text-foreground">
                {selectedDish.dishName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("foodPickerModal.allIngredientsWillBeAdded", {
                  calories: selectedDish.totalCalories,
                })}
              </p>
            </div>
            <Button type="button" className="w-full" onClick={confirmDish}>
              {t("foodPickerModal.addDish")}
            </Button>
          </div>
        )}

        {/* Manual entry fallback */}
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => {
              close();
              onManualEntry();
            }}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground py-2"
          >
            <PencilLine className="w-4 h-4" />
            {t("foodPickerModal.notInList")}
          </button>
        </div>
      </div>
    </>
  );
}

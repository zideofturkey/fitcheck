import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Moon,
  Apple,
  Sandwich,
  Salad,
  ChevronDown,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateMealLog } from "@/hooks/api/use-mealtracker";
import FoodPickerModal, {
  type PickedFoodLine,
} from "@/components/FoodPickerModal";
import { validateNutritionValues } from "@/lib/nutrition-validation";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

type LineSource =
  | "foodLibrary"
  | "presetTemplate"
  | "dishTemplate"
  | "manualEntry";

interface FoodItemEntry {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  source: LineSource;
  sourceFoodItemId?: string;
  sourcePresetMealId?: string;
  sourceDishId?: string;
  // Per-100g density snapshotted at pick time (derived from the picked
  // line's own absolute values / gramAmount) so the "Miktar" field can
  // rescale calories/protein/etc when the user changes it later - e.g.
  // logging 250g eaten out of a 505g dish/foodItem line. Left undefined
  // for manualEntry rows, where the user types absolute totals directly
  // and no linear density is assumed.
  caloriePer100g?: number;
  proteinPer100g?: number;
  carbohydratePer100g?: number;
  fatPer100g?: number;
  sugarPer100g?: number;
  fiberPer100g?: number;
}

type WizardStep = 1 | 2 | 3;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function deriveLogSource(items: FoodItemEntry[]): LineSource {
  const sources = new Set(items.map((i) => i.source));
  if (sources.size === 0) return "manualEntry";
  if (sources.size === 1) {
    return items[0].source;
  }
  // Mixed sources — prefer the most "structured" one present.
  if (sources.has("presetTemplate")) return "presetTemplate";
  if (sources.has("dishTemplate")) return "dishTemplate";
  if (sources.has("foodLibrary")) return "foodLibrary";
  return "manualEntry";
}

const MACRO_TO_PER100G_FIELD = {
  calories: "caloriePer100g",
  protein: "proteinPer100g",
  carbs: "carbohydratePer100g",
  fat: "fatPer100g",
  sugar: "sugarPer100g",
  fiber: "fiberPer100g",
} as const satisfies Partial<Record<keyof FoodItemEntry, keyof FoodItemEntry>>;

function LogMealPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateMealLog();
  const [step, setStep] = useState<WizardStep>(1);
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState(nowTime());
  const [mealSlot, setMealSlot] = useState<MealSlot>("lunch");
  const [customSlotName, setCustomSlotName] = useState("");
  const [notes, setNotes] = useState("");
  const [foodItems, setFoodItems] = useState<FoodItemEntry[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const slotOptions: {
    value: MealSlot;
    icon: React.ElementType;
    label: string;
  }[] = [
    { value: "breakfast", icon: Sunrise, label: t("logMeal.breakfast") },
    { value: "lunch", icon: Sun, label: t("logMeal.lunch") },
    { value: "dinner", icon: Moon, label: t("logMeal.dinner") },
    { value: "snack", icon: Apple, label: t("logMeal.snack") },
  ];

  const updateFoodItem = (
    id: string,
    field: keyof FoodItemEntry,
    value: string | number,
  ) => {
    setFoodItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "grams") {
          const newGrams = Number(value) || 0;
          // Rescale the macros from the item's own per-100g density
          // (snapshotted at pick time) whenever one is available, so
          // e.g. changing 505g to the 250g actually eaten recalculates
          // calories/protein/etc instead of leaving the old totals static.
          if (item.caloriePer100g !== undefined) {
            const factor = newGrams / 100;
            return {
              ...item,
              grams: newGrams,
              calories: Math.round((item.caloriePer100g ?? 0) * factor),
              protein: +((item.proteinPer100g ?? 0) * factor).toFixed(2),
              carbs: +((item.carbohydratePer100g ?? 0) * factor).toFixed(2),
              fat: +((item.fatPer100g ?? 0) * factor).toFixed(2),
              sugar: +((item.sugarPer100g ?? 0) * factor).toFixed(2),
              fiber: +((item.fiberPer100g ?? 0) * factor).toFixed(2),
            };
          }
          return { ...item, grams: newGrams };
        }
        // Editing a macro field by hand re-anchors that field's per-100g
        // density to the new value, so a later gram change scales from
        // what the user just typed rather than reverting to the original
        // picked density.
        const per100gField =
          MACRO_TO_PER100G_FIELD[field as keyof typeof MACRO_TO_PER100G_FIELD];
        if (per100gField && item.grams > 0) {
          const newValue = Number(value) || 0;
          return {
            ...item,
            [field]: newValue,
            [per100gField]: (newValue / item.grams) * 100,
          };
        }
        return { ...item, [field]: value };
      }),
    );
  };

  const removeFoodItem = (id: string) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addFoodItem = () => {
    const newId = String(Date.now());
    setFoodItems((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        grams: 100,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        source: "manualEntry",
      },
    ]);
  };

  const addPickedLines = (lines: PickedFoodLine[]) => {
    const newEntries: FoodItemEntry[] = lines.map((l) => {
      // Snapshot a per-100g density from the picked line's own absolute
      // values so the "Miktar" field can rescale nutrition later (e.g. the
      // dish's line was saved at 505g but the user only ate 250g of it).
      const density = l.consumedGrams > 0 ? 100 / l.consumedGrams : 0;
      return {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        name: l.itemName,
        grams: l.consumedGrams,
        calories: l.itemCalories,
        protein: l.itemProtein,
        carbs: l.itemCarbohydrates,
        fat: l.itemFat,
        sugar: l.itemSugar,
        fiber: l.itemFiber,
        source: l.lineSource,
        sourceFoodItemId: l.sourceFoodItemId,
        sourcePresetMealId: l.sourcePresetMealId,
        sourceDishId: l.sourceDishId,
        caloriePer100g: l.itemCalories * density,
        proteinPer100g: l.itemProtein * density,
        carbohydratePer100g: l.itemCarbohydrates * density,
        fatPer100g: l.itemFat * density,
        sugarPer100g: l.itemSugar * density,
        fiberPer100g: l.itemFiber * density,
      };
    });
    setFoodItems((prev) => [...prev, ...newEntries]);
  };

  const totals = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      sugar: acc.sugar + item.sugar,
      fiber: acc.fiber + item.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 },
  );

  const validateFoodItems = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    for (const item of foodItems) {
      const density = item.grams > 0 ? 100 / item.grams : 0;
      const result = validateNutritionValues({
        caloriePer100g: item.calories * density,
        proteinPer100g: item.protein * density,
        carbohydratePer100g: item.carbs * density,
        fatPer100g: item.fat * density,
        sugarPer100g: item.sugar * density,
        fiberPer100g: item.fiber * density,
      });
      const label = item.name || t("logMeal.foodNamePlaceholder");
      errors.push(...result.errors.map((err) => `${label}: ${err}`));
      warnings.push(...result.warnings.map((w) => `${label}: ${w}`));
    }
    return { errors, warnings };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { errors, warnings } = validateFoodItems();
    setValidationErrors(errors);
    setValidationWarnings(errors.length > 0 ? [] : warnings);
    if (errors.length > 0 || warnings.length > 0) return;
    commitMeal();
  };

  const commitMeal = () => {
    setValidationErrors([]);
    setValidationWarnings([]);
    const slotName = customSlotName || mealSlot;
    createMutation.mutate(
      {
        mealDate: date,
        mealTime: time,
        slotName,
        logSource: deriveLogSource(foodItems) as
          | "foodLibrary"
          | "presetTemplate"
          | "manualEntry",
        noteText: notes || undefined,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbohydrates: totals.carbs,
        totalFat: totals.fat,
        totalSugar: totals.sugar,
        totalFiber: totals.fiber,
        lines: foodItems.map((f) => ({
          itemName: f.name,
          consumedGrams: f.grams,
          itemCalories: f.calories,
          itemProtein: f.protein,
          itemCarbohydrates: f.carbs,
          itemFat: f.fat,
          itemSugar: f.sugar,
          itemFiber: f.fiber,
          // "dishTemplate" isn't in the generated union (mealLine.lineSource
          // is an unvalidated free string column backend-side) — cast here
          // rather than editing the auto-generated mealtracker-api.ts types.
          lineSource: f.source as "foodLibrary" | "presetTemplate" | "manualEntry",
          sourceFoodItemId: f.sourceFoodItemId,
          sourcePresetMealId: f.sourcePresetMealId,
        })),
      },
      {
        onSuccess: (res) => {
          const id = res.mealLog?.id;
          navigate(id ? `/meals/${id}` : "/meals");
        },
      },
    );
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { num: 1, icon: Calendar, label: t("logMeal.stepDateTime") },
        { num: 2, icon: Clock, label: t("logMeal.stepMealSlot") },
        { num: 3, icon: Sandwich, label: t("logMeal.stepFoodItems") },
      ].map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <span
              className={`text-xs font-medium ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div
              className={`w-10 h-0.5 ${step > s.num ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const formContent = (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("logMeal.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("logMeal.subtitle")}
        </p>
      </header>

      {stepIndicator}

      {/* STEP 1: Date & Time */}
      {step === 1 && (
        <form
          className="mt-10 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("logMeal.whenDidYouEat")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 min-w-0">
                <label className="block text-sm font-medium text-foreground">
                  {t("logMeal.date")}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <label className="block text-sm font-medium text-foreground">
                  {t("logMeal.time")}
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground text-left">
                {t("logMeal.futurePlanningHint")}
              </p>
              <Button type="submit" className="flex-shrink-0">
                {t("logMeal.nextMealSlot")} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </form>
      )}

      {/* STEP 2: Meal Slot */}
      {step === 2 && (
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("logMeal.whichMeal")}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-muted rounded-lg w-full sm:w-fit">
              {slotOptions.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setMealSlot(slot.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${mealSlot === slot.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <span className="flex items-center gap-1.5">
                    <slot.icon className="w-4 h-4" />
                    {slot.label}
                  </span>
                </button>
              ))}
            </div>
            <div
              className={`space-y-2 ${mealSlot === "snack" ? "" : "hidden"}`}
            >
              <label className="block text-sm font-medium text-foreground">
                {t("logMeal.customSlotName")}
              </label>
              <input
                type="text"
                value={customSlotName}
                onChange={(e) => setCustomSlotName(e.target.value)}
                placeholder={t("logMeal.customSlotPlaceholder")}
                className="w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4" />
                {t("logMeal.back")}
              </Button>
              <Button type="submit">
                {t("logMeal.nextAddFoods")} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </form>
      )}

      {/* STEP 3: Food Items */}
      {step === 3 && (
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                3
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("logMeal.whatDidYouEat")}
              </h2>
            </div>
            <div className="space-y-4">
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${item.source === "manualEntry" ? "bg-chart-3/20" : "bg-accent/30"}`}
                      >
                        {item.source === "manualEntry" ? (
                          <Salad className="w-5 h-5 text-chart-3" />
                        ) : (
                          <Sandwich className="w-5 h-5 text-accent-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateFoodItem(item.id, "name", e.target.value)
                          }
                          placeholder={t("logMeal.foodNamePlaceholder")}
                          className="w-full bg-transparent border-none text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.source === "manualEntry"
                            ? t("logMeal.manualEntry")
                            : item.source === "presetTemplate"
                              ? t("logMeal.fromPresetMeal")
                              : item.source === "dishTemplate"
                                ? t("logMeal.fromDish")
                                : t("logMeal.fromFoodLibrary")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFoodItem(item.id)}
                      className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={t("logMeal.removeItemAria")}
                      title={t("logMeal.removeItemAria")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">
                      {t("logMeal.amount")}
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={item.grams === 0 ? "" : item.grams}
                        min={1}
                        placeholder="100"
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateFoodItem(
                            item.id,
                            "grams",
                            raw === "" ? 0 : Number(raw),
                          );
                        }}
                        className="w-full rounded-lg border border-input bg-card px-3 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {t("logMeal.grams")}
                      </span>
                    </div>
                  </div>
                  <details className="group">
                    <summary className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none">
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      {t("logMeal.nutritionSnapshot")}
                    </summary>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: t("logMeal.calories"),
                          field: "calories" as const,
                          step: 1,
                        },
                        {
                          label: t("logMeal.protein"),
                          field: "protein" as const,
                          step: 0.1,
                        },
                        {
                          label: t("logMeal.carbs"),
                          field: "carbs" as const,
                          step: 0.1,
                        },
                        {
                          label: t("logMeal.fat"),
                          field: "fat" as const,
                          step: 0.1,
                        },
                        {
                          label: t("logMeal.sugar"),
                          field: "sugar" as const,
                          step: 0.1,
                        },
                        {
                          label: t("logMeal.fiber"),
                          field: "fiber" as const,
                          step: 0.1,
                        },
                      ].map(({ label, field, step: s }) => (
                        <div key={field} className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            {label}
                          </label>
                          <input
                            type="number"
                            value={item[field] === 0 ? "" : item[field]}
                            placeholder="0"
                            step={s}
                            onChange={(e) => {
                              const raw = e.target.value;
                              updateFoodItem(
                                item.id,
                                field,
                                raw === "" ? 0 : Number(raw),
                              );
                            }}
                            className="w-full rounded-md border border-input bg-muted/50 px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                {t("logMeal.addFoodItem")}
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t("logMeal.notes")}{" "}
                <span className="text-muted-foreground font-normal">
                  {t("logMeal.optional")}
                </span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("logMeal.notesPlaceholder")}
                className="w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-none"
              />
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("logMeal.mealTotals")}
              </h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
                {[
                  {
                    label: t("logMeal.calories"),
                    value: totals.calories,
                    unit: "",
                  },
                  {
                    label: t("dashboard.protein"),
                    value: totals.protein.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: t("dashboard.carbs"),
                    value: totals.carbs,
                    unit: "g",
                  },
                  {
                    label: t("dashboard.fat"),
                    value: totals.fat.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: t("dashboard.sugar"),
                    value: totals.sugar,
                    unit: "g",
                  },
                  {
                    label: t("dashboard.fiber"),
                    value: totals.fiber.toFixed(1),
                    unit: "g",
                  },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold text-foreground">
                      {value}
                      <span className="text-xs font-normal text-muted-foreground">
                        {unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {validationErrors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 space-y-1">
                {validationErrors.map((err) => (
                  <p key={err} className="text-xs text-destructive">
                    {err}
                  </p>
                ))}
              </div>
            )}
            {validationWarnings.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 space-y-2">
                {validationWarnings.map((w) => (
                  <p key={w} className="text-xs text-amber-700">
                    {w}
                  </p>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={commitMeal}
                >
                  Anlıyorum, bu değerlerle devam et
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="w-4 h-4" />
                {t("logMeal.back")}
              </Button>
              <Button
                type="submit"
                className="shadow-md hover:shadow-lg"
                disabled={foodItems.length === 0}
              >
                <Check className="w-4 h-4" />
                {t("logMeal.logMealBtn")}
              </Button>
            </div>
          </section>
        </form>
      )}
    </div>
  );

  return (
    <>
      <FoodPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addPickedLines}
        onManualEntry={addFoodItem}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto native-scroll bg-background pb-24 safe-bottom md:pb-6 md:p-6 lg:p-10">
          <div className="md:max-w-5xl md:mx-auto">
            <div className="pb-8 relative">
              <div
                className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
                aria-hidden="true"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
              </div>
              {formContent}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* Inline SVG-backed icon components — lucide-react doesn't export all needed icons */
function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
function BarChart2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}
function SaladIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 21h10" />
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
function UtensilsCrossedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 2v4a2 2 0 0 1-2 2h0a2 2 0 0 0-2 2v2" />
      <path d="M20 2v5a2 2 0 0 1-2 2h0a2 2 0 0 0-2 2v3" />
      <path d="m22 22-5-5" />
      <path d="M3 2v15a3 3 0 0 0 3 3h6" />
      <path d="M3 7h14" />
      <path d="M7 2v20" />
    </svg>
  );
}
function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5" />
      <path d="m22 17-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17" />
    </svg>
  );
}
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export default LogMealPage;

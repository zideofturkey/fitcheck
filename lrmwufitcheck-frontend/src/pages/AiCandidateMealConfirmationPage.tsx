import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  ChevronDown,
  Loader,
  Sparkles,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useConfirmCandidateMeal,
  useGetAiCandidateMeal,
  useRejectCandidateMeal,
} from "@/hooks/api/use-nutritionai";
import { useListAiCandidateLines } from "@/hooks/api/use-nutritionai-helpers";
import { CATEGORIES, categoryLabel } from "@/lib/food-category";
import { DISH_CATEGORIES, dishCategoryLabel } from "@/lib/dish-category";

type SaveAsType = "food" | "dish";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

const MACRO_KEYS = [
  "estimatedCalories",
  "estimatedProtein",
  "estimatedCarbohydrates",
  "estimatedFat",
  "estimatedSugar",
  "estimatedFiber",
] as const;
type MacroKey = (typeof MACRO_KEYS)[number];

interface LineEdit {
  aiCandidateLineId: string;
  detectedFoodName: string;
  estimatedGrams: number;
  saveAsFood: boolean;
  saveAsType: SaveAsType;
  foodCategory: string;
  dishCategory: string;
  brandName: string;
  baseName: string;
  macros: Record<MacroKey, number>;
  // Per-gram density used to scale macros when grams change. Starts from
  // the AI's original values; re-derived from the current macro value
  // whenever the user edits that macro field directly, so a later gram
  // change scales from the user's correction instead of the AI's.
  density: Record<MacroKey, number>;
}

interface Totals {
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalSugar: number;
  totalFiber: number;
}

function sumTotals(lines: LineEdit[]): Totals {
  return lines.reduce(
    (acc, l) => ({
      totalCalories: acc.totalCalories + (l.macros.estimatedCalories || 0),
      totalProtein: acc.totalProtein + (l.macros.estimatedProtein || 0),
      totalCarbohydrates:
        acc.totalCarbohydrates + (l.macros.estimatedCarbohydrates || 0),
      totalFat: acc.totalFat + (l.macros.estimatedFat || 0),
      totalSugar: acc.totalSugar + (l.macros.estimatedSugar || 0),
      totalFiber: acc.totalFiber + (l.macros.estimatedFiber || 0),
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
    },
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Same four slots (and same custom-name-for-snack pattern) as the manual
// "Öğün Ekle" flow, so AI-confirmed meals use identical slot options.
const SLOT_OPTIONS: { value: MealSlot; label: string }[] = [
  { value: "breakfast", label: "Kahvaltı" },
  { value: "lunch", label: "Öğle Yemeği" },
  { value: "dinner", label: "Akşam Yemeği" },
  { value: "snack", label: "Atıştırmalık" },
];

function guessMealSlot(proposedSlotName: string | null | undefined): {
  slot: MealSlot;
  customName: string;
} {
  const match = SLOT_OPTIONS.find((o) => o.label === proposedSlotName);
  if (match) return { slot: match.value, customName: "" };
  return { slot: "snack", customName: proposedSlotName || "" };
}

export default function AiCandidateMealConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetAiCandidateMeal(id);
  const { data: linesData, isLoading: linesLoading } =
    useListAiCandidateLines(id);
  const confirmMutation = useConfirmCandidateMeal();
  const rejectMutation = useRejectCandidateMeal();

  const candidate = data?.aiCandidateMeal;
  const lines = linesData?.aiCandidateLines ?? [];

  const [lineEdits, setLineEdits] = useState<LineEdit[]>([]);
  const [totals, setTotals] = useState<Totals>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbohydrates: 0,
    totalFat: 0,
    totalSugar: 0,
    totalFiber: 0,
  });
  const [mealDate, setMealDate] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealSlot, setMealSlot] = useState<MealSlot>("snack");
  const [customSlotName, setCustomSlotName] = useState("");

  // Seed editable state from the fetched data exactly once, via an effect
  // (not during render) so it can't clobber an in-progress edit.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!candidate || linesLoading) return;
    const seeded: LineEdit[] = lines.map((line) => {
      const macros: Record<MacroKey, number> = {
        estimatedCalories: line.estimatedCalories ?? 0,
        estimatedProtein: line.estimatedProtein ?? 0,
        estimatedCarbohydrates: line.estimatedCarbohydrates ?? 0,
        estimatedFat: line.estimatedFat ?? 0,
        estimatedSugar: line.estimatedSugar ?? 0,
        estimatedFiber: line.estimatedFiber ?? 0,
      };
      const grams = line.estimatedGrams || 1;
      const density = MACRO_KEYS.reduce(
        (acc, key) => ({ ...acc, [key]: macros[key] / grams }),
        {} as Record<MacroKey, number>,
      );
      return {
        aiCandidateLineId: line.id,
        detectedFoodName: line.detectedFoodName,
        estimatedGrams: line.estimatedGrams,
        saveAsFood: line.saveAsFood,
        saveAsType: "food",
        foodCategory: "",
        dishCategory: "",
        brandName: "",
        baseName: "",
        macros,
        density,
      };
    });
    setLineEdits(seeded);
    setTotals(sumTotals(seeded));
    // The AI often doesn't propose a date/time at all (it only fills these
    // in when the user's wording references one) — default to now so
    // confirming never sends mealtracker a blank, rejected mealDate.
    setMealDate(candidate.proposedMealDate || todayIso());
    setMealTime(candidate.proposedMealTime || nowTime());
    const { slot, customName } = guessMealSlot(candidate.proposedSlotName);
    setMealSlot(slot);
    setCustomSlotName(customName);
    seededRef.current = true;
  }, [candidate, lines, linesLoading]);

  if (isLoading || linesLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("common.loading")}
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("aiCandidateMeal.notFound")}
        </p>
        <Link
          to="/ai-sessions"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("aiCandidateMeal.backToSessions")}
        </Link>
      </Card>
    );
  }

  const updateLineField = (
    lineId: string,
    patch: Partial<
      Pick<
        LineEdit,
        | "detectedFoodName"
        | "saveAsFood"
        | "saveAsType"
        | "foodCategory"
        | "dishCategory"
        | "brandName"
        | "baseName"
      >
    >,
  ) => {
    setLineEdits((prev) =>
      prev.map((l) => (l.aiCandidateLineId === lineId ? { ...l, ...patch } : l)),
    );
  };

  const updateLineGrams = (lineId: string, newGrams: number) => {
    setLineEdits((prev) => {
      const next = prev.map((l) => {
        if (l.aiCandidateLineId !== lineId) return l;
        const macros = MACRO_KEYS.reduce(
          (acc, key) => ({ ...acc, [key]: round1(l.density[key] * newGrams) }),
          {} as Record<MacroKey, number>,
        );
        return { ...l, estimatedGrams: newGrams, macros };
      });
      setTotals(sumTotals(next));
      return next;
    });
  };

  const updateLineMacro = (lineId: string, macroKey: MacroKey, value: number) => {
    setLineEdits((prev) => {
      const next = prev.map((l) => {
        if (l.aiCandidateLineId !== lineId) return l;
        const grams = l.estimatedGrams || 1;
        return {
          ...l,
          macros: { ...l.macros, [macroKey]: value },
          // Re-derive this macro's density from the user's correction so a
          // future gram change scales from the corrected value, not AI's.
          density: { ...l.density, [macroKey]: value / grams },
        };
      });
      setTotals(sumTotals(next));
      return next;
    });
  };

  const updateTotal = (key: keyof Totals, value: number) => {
    setTotals((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    const finalSlotName = customSlotName.trim() || mealSlot;
    confirmMutation.mutate(
      {
        aiCandidateMealId: candidate.id,
        data: {
          proposedMealDate: mealDate || undefined,
          proposedMealTime: mealTime || undefined,
          proposedSlotName: finalSlotName || undefined,
          lineAdjustments: lineEdits.map((l) => ({
            aiCandidateLineId: l.aiCandidateLineId,
            estimatedGrams: l.estimatedGrams,
            saveAsFood: l.saveAsFood,
            ...(l.saveAsFood
              ? {
                  saveAsType: l.saveAsType,
                  ...(l.saveAsType === "food"
                    ? {
                        foodCategory: l.foodCategory || undefined,
                        brandName: l.brandName || undefined,
                        baseName: l.baseName || undefined,
                      }
                    : { dishCategory: l.dishCategory || undefined }),
                }
              : {}),
            ...l.macros,
          })),
        },
      },
      {
        onSuccess: (res) => {
          toast.success(t("aiCandidateMeal.confirmSuccess"));
          // Land on the just-created meal log's detail page so the user
          // immediately sees what was saved; fall back to history if the
          // committed log id isn't in the response for any reason.
          const mealLogId = (
            res?.aiCandidateMeal as
              | { committedMealLogId?: string | null }
              | undefined
          )?.committedMealLogId;
          navigate(mealLogId ? `/meals/${mealLogId}` : "/meals", {
            replace: true,
          });
        },
      },
    );
  };

  const handleReject = () => {
    rejectMutation.mutate(candidate.id, {
      onSuccess: () => navigate("/ai-sessions"),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <Link
          to="/ai-sessions"
          className="rounded-full p-2 hover:bg-muted transition-colors"
          aria-label={t("common.back")}
          title={t("common.back")}
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("aiCandidateMeal.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("aiCandidateMeal.subtitle")}
          </p>
        </div>
      </header>

      <Card className="p-5 shadow-sm space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            {t("aiCandidateMeal.aiCandidate")}
          </span>
          {candidate.isCommitted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CircleCheck className="w-3.5 h-3.5" /> {t("aiCandidateMeal.committed")}
            </span>
          )}
        </div>

        {!candidate.isCommitted && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5">{t("aiCandidateMeal.date")}</Label>
                <Input
                  type="date"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5">{t("aiCandidateMeal.time")}</Label>
                <Input
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5">{t("aiCandidateMeal.slot")}</Label>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
                {SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMealSlot(opt.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mealSlot === opt.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {mealSlot === "snack" && (
                <Input
                  type="text"
                  value={customSlotName}
                  onChange={(e) => setCustomSlotName(e.target.value)}
                  placeholder={t("logMeal.customSlotPlaceholder")}
                  className="mt-2"
                />
              )}
            </div>
          </>
        )}

        {candidate.warningText && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠ {candidate.warningText}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
          {(
            [
              ["totalCalories", t("aiCandidateMeal.calories"), t("common.kcal")],
              ["totalProtein", t("aiCandidateMeal.protein"), "g"],
              ["totalCarbohydrates", t("aiCandidateMeal.carbs"), "g"],
              ["totalFat", t("aiCandidateMeal.fat"), "g"],
              ["totalSugar", t("aiCandidateMeal.sugar"), "g"],
              ["totalFiber", t("aiCandidateMeal.fiber"), "g"],
            ] as [keyof Totals, string, string][]
          ).map(([key, label, unit]) => (
            <div key={key}>
              <Label className="mb-1 text-xs text-muted-foreground">
                {label}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  value={totals[key]}
                  disabled={candidate.isCommitted}
                  onChange={(e) => updateTotal(key, Number(e.target.value) || 0)}
                  className="pr-8 text-sm font-semibold"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {!candidate.isCommitted && (
        <Card className="p-5 shadow-sm space-y-4 mb-6">
          <h2 className="text-base font-semibold">
            {t("aiCandidateMeal.itemsTitle")}
          </h2>
          <div className="space-y-4">
            {lineEdits.map((line) => (
              <div
                key={line.aiCandidateLineId}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5">
                      {t("aiCandidateMeal.foodName")}
                    </Label>
                    <Input
                      type="text"
                      value={line.detectedFoodName}
                      onChange={(e) =>
                        updateLineField(line.aiCandidateLineId, {
                          detectedFoodName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5">
                      {t("aiCandidateMeal.grams")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={line.estimatedGrams}
                      onChange={(e) =>
                        updateLineGrams(
                          line.aiCandidateLineId,
                          Number(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={line.saveAsFood}
                    onChange={(e) =>
                      updateLineField(line.aiCandidateLineId, {
                        saveAsFood: e.target.checked,
                      })
                    }
                    className="rounded border-input"
                  />
                  <BookmarkPlus className="w-4 h-4" />
                  {t("aiCandidateMeal.saveAsFood")}
                </label>

                {line.saveAsFood && (
                  <div className="ml-6 space-y-3 rounded-md border border-border bg-muted/30 p-3">
                    <div>
                      <Label className="mb-1.5 text-xs">
                        {t("aiCandidateMeal.saveAsWhat")}
                      </Label>
                      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
                        {(
                          [
                            ["food", t("aiCandidateMeal.saveAsFoodOption")],
                            ["dish", t("aiCandidateMeal.saveAsDishOption")],
                          ] as [SaveAsType, string][]
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateLineField(line.aiCandidateLineId, {
                                saveAsType: value,
                              })
                            }
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              line.saveAsType === value
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {line.saveAsType === "food" ? (
                      <>
                        <div>
                          <Label className="mb-1.5 text-xs">
                            {t("aiCandidateMeal.categoryLabel")}
                          </Label>
                          <select
                            value={line.foodCategory}
                            onChange={(e) =>
                              updateLineField(line.aiCandidateLineId, {
                                foodCategory: e.target.value,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">
                              {t("aiCandidateMeal.categoryPlaceholder")}
                            </option>
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {categoryLabel(t, cat)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="mb-1.5 text-xs">
                              {t("aiCandidateMeal.brandLabel")}
                            </Label>
                            <Input
                              type="text"
                              value={line.brandName}
                              placeholder={t(
                                "aiCandidateMeal.brandPlaceholder",
                              )}
                              onChange={(e) =>
                                updateLineField(line.aiCandidateLineId, {
                                  brandName: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="mb-1.5 text-xs">
                              {t("aiCandidateMeal.baseNameLabel")}
                            </Label>
                            <Input
                              type="text"
                              value={line.baseName}
                              placeholder={t(
                                "aiCandidateMeal.baseNamePlaceholder",
                              )}
                              onChange={(e) =>
                                updateLineField(line.aiCandidateLineId, {
                                  baseName: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label className="mb-1.5 text-xs">
                          {t("aiCandidateMeal.categoryLabel")}
                        </Label>
                        <select
                          value={line.dishCategory}
                          onChange={(e) =>
                            updateLineField(line.aiCandidateLineId, {
                              dishCategory: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">
                            {t("aiCandidateMeal.categoryPlaceholder")}
                          </option>
                          {DISH_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {dishCategoryLabel(t, cat)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <details className="group">
                  <summary className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none">
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    {t("aiCandidateMeal.editMacros")}
                  </summary>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["estimatedCalories", t("aiCandidateMeal.calories")],
                        ["estimatedProtein", t("aiCandidateMeal.protein")],
                        [
                          "estimatedCarbohydrates",
                          t("aiCandidateMeal.carbs"),
                        ],
                        ["estimatedFat", t("aiCandidateMeal.fat")],
                        ["estimatedSugar", t("aiCandidateMeal.sugar")],
                        ["estimatedFiber", t("aiCandidateMeal.fiber")],
                      ] as [MacroKey, string][]
                    ).map(([macroKey, label]) => (
                      <div key={macroKey} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {label}
                        </Label>
                        <Input
                          type="number"
                          step="any"
                          value={line.macros[macroKey]}
                          onChange={(e) =>
                            updateLineMacro(
                              line.aiCandidateLineId,
                              macroKey,
                              Number(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
            {lineEdits.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("aiCandidateMeal.noItems")}
              </p>
            )}
          </div>
        </Card>
      )}

      {!candidate.isCommitted && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            <CircleX className="w-4 h-4" />
            {t("common.reject")}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            <CircleCheck className="w-4 h-4" />
            {confirmMutation.isPending
              ? t("aiCandidateMeal.committing")
              : t("aiCandidateMeal.confirmAndLog")}
          </Button>
        </div>
      )}
    </div>
  );
}

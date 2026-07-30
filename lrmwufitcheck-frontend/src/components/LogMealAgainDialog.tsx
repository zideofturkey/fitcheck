import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListAiCandidateLines } from "@/hooks/api/use-nutritionai-helpers";
import { useCreateMealLog } from "@/hooks/api/use-mealtracker";
import type { NutritionaiAiCandidateMeal } from "@/types/api";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

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

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

interface LineState {
  id: string;
  detectedFoodName: string;
  grams: number;
  density: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    sugar: number;
    fiber: number;
  };
}

export default function LogMealAgainDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: NutritionaiAiCandidateMeal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { data: linesData } = useListAiCandidateLines(
    open ? candidate.id : undefined,
  );
  const createMealLog = useCreateMealLog();

  const [mealDate, setMealDate] = useState(todayIso());
  const [mealTime, setMealTime] = useState(nowTime());
  const [mealSlot, setMealSlot] = useState<MealSlot>("snack");
  const [customSlotName, setCustomSlotName] = useState("");
  const [lineStates, setLineStates] = useState<LineState[]>([]);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!open) {
      setSeeded(false);
      return;
    }
    if (seeded || !linesData) return;
    const { slot, customName } = guessMealSlot(candidate.proposedSlotName);
    setMealSlot(slot);
    setCustomSlotName(customName);
    setMealDate(todayIso());
    setMealTime(nowTime());
    setLineStates(
      (linesData.aiCandidateLines ?? []).map((l) => {
        const grams = l.estimatedGrams || 1;
        return {
          id: l.id,
          detectedFoodName: l.detectedFoodName,
          grams: l.estimatedGrams,
          density: {
            calories: (l.estimatedCalories ?? 0) / grams,
            protein: (l.estimatedProtein ?? 0) / grams,
            carbohydrates: (l.estimatedCarbohydrates ?? 0) / grams,
            fat: (l.estimatedFat ?? 0) / grams,
            sugar: (l.estimatedSugar ?? 0) / grams,
            fiber: (l.estimatedFiber ?? 0) / grams,
          },
        };
      }),
    );
    setSeeded(true);
  }, [open, seeded, linesData, candidate.proposedSlotName]);

  const updateGrams = (lineId: string, grams: number) => {
    setLineStates((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, grams } : l)),
    );
  };

  const totals = lineStates.reduce(
    (acc, l) => ({
      calories: acc.calories + round1(l.density.calories * l.grams),
      protein: acc.protein + round1(l.density.protein * l.grams),
      carbohydrates:
        acc.carbohydrates + round1(l.density.carbohydrates * l.grams),
      fat: acc.fat + round1(l.density.fat * l.grams),
      sugar: acc.sugar + round1(l.density.sugar * l.grams),
      fiber: acc.fiber + round1(l.density.fiber * l.grams),
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sugar: 0, fiber: 0 },
  );

  const handleSave = () => {
    const finalSlotName = customSlotName.trim() || mealSlot;
    createMealLog.mutate(
      {
        mealDate,
        mealTime,
        slotName: finalSlotName,
        logSource: "aiAssistant",
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbohydrates: totals.carbohydrates,
        totalFat: totals.fat,
        totalSugar: totals.sugar,
        totalFiber: totals.fiber,
        lines: lineStates.map((l) => ({
          itemName: l.detectedFoodName,
          consumedGrams: l.grams,
          itemCalories: round1(l.density.calories * l.grams),
          itemProtein: round1(l.density.protein * l.grams),
          itemCarbohydrates: round1(l.density.carbohydrates * l.grams),
          itemFat: round1(l.density.fat * l.grams),
          itemSugar: round1(l.density.sugar * l.grams),
          itemFiber: round1(l.density.fiber * l.grams),
          lineSource: "aiAssistant",
        })),
      },
      {
        onSuccess: () => {
          toast.success(t("aiSessionDetail.logAgainSuccess"));
          onOpenChange(false);
        },
        onError: () => toast.error(t("aiSessionDetail.logAgainError")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("aiSessionDetail.logAgain")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit flex-wrap">
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

          <div className="space-y-3">
            <Label>{t("aiCandidateMeal.itemsTitle")}</Label>
            {lineStates.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="flex-1 text-sm text-foreground truncate">
                  {l.detectedFoodName}
                </span>
                <div className="relative w-28 shrink-0">
                  <Input
                    type="number"
                    min={0}
                    value={l.grams}
                    onChange={(e) =>
                      updateGrams(l.id, Number(e.target.value) || 0)
                    }
                    className="pr-8"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    {t("logMeal.grams")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("aiCandidateMeal.calories")}
              </p>
              <p className="text-sm font-semibold">
                {round1(totals.calories)} {t("common.kcal")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("aiCandidateMeal.protein")}
              </p>
              <p className="text-sm font-semibold">
                {round1(totals.protein)} g
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("aiCandidateMeal.carbs")}
              </p>
              <p className="text-sm font-semibold">
                {round1(totals.carbohydrates)} g
              </p>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleSave}
            disabled={createMealLog.isPending || lineStates.length === 0}
          >
            {createMealLog.isPending
              ? t("aiSessionDetail.loggingAgain")
              : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatPicker } from "@/components/ui/flat-picker";
import { useListAiCandidateLines } from "@/hooks/api/use-nutritionai-helpers";
import { useCreateFoodItem } from "@/hooks/api/use-nutritionlibrary";
import { useCreateDish, useAddDishLine } from "@/hooks/api/use-dish";
import { useCreatePresetMeal } from "@/hooks/api/use-nutritionlibrary";
import { addPresetLineManual } from "@/services/api/preset-line-helpers";
import type { NutritionaiAiCandidateMeal } from "@/types/api";

type LineTarget = "skip" | "food" | "dish";

export default function SaveCandidateToLibraryDialog({
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
  const createFoodItem = useCreateFoodItem();
  const createDish = useCreateDish();
  const addDishLine = useAddDishLine();
  const createPresetMeal = useCreatePresetMeal();

  const lines = linesData?.aiCandidateLines ?? [];

  const [bulkMode, setBulkMode] = useState(false);
  const [presetMealName, setPresetMealName] = useState("");
  const [targets, setTargets] = useState<Record<string, LineTarget>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBulkMode(false);
    setPresetMealName("");
    const initial: Record<string, LineTarget> = {};
    lines.forEach((l) => {
      initial[l.id] = "food";
    });
    setTargets(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, linesData]);

  const perGram = (l: (typeof lines)[number]) => {
    const grams = l.estimatedGrams || 100;
    const factor = 100 / grams;
    return {
      caloriePer100g: Math.round((l.estimatedCalories ?? 0) * factor),
      proteinPer100g: Number(((l.estimatedProtein ?? 0) * factor).toFixed(1)),
      carbohydratePer100g: Number(
        ((l.estimatedCarbohydrates ?? 0) * factor).toFixed(1),
      ),
      fatPer100g: Number(((l.estimatedFat ?? 0) * factor).toFixed(1)),
      sugarPer100g: Number(((l.estimatedSugar ?? 0) * factor).toFixed(1)),
      fiberPer100g: Number(((l.estimatedFiber ?? 0) * factor).toFixed(1)),
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (bulkMode) {
        const name = presetMealName.trim();
        if (!name) {
          toast.error(t("aiSessionDetail.presetNameRequired"));
          setSaving(false);
          return;
        }
        const presetRes = await createPresetMeal.mutateAsync({
          templateName: name,
        });
        const presetMealId = presetRes.presetMeal.id;
        for (const l of lines) {
          const macros = perGram(l);
          await addPresetLineManual(presetMealId, {
            manualFoodName: l.detectedFoodName,
            manualCaloriePer100g: macros.caloriePer100g,
            manualProteinPer100g: macros.proteinPer100g,
            manualCarbohydratePer100g: macros.carbohydratePer100g,
            manualFatPer100g: macros.fatPer100g,
            manualSugarPer100g: macros.sugarPer100g,
            manualFiberPer100g: macros.fiberPer100g,
            gramAmount: l.estimatedGrams,
          });
        }
      } else {
        for (const l of lines) {
          const target = targets[l.id] ?? "skip";
          if (target === "skip") continue;
          const macros = perGram(l);
          if (target === "food") {
            await createFoodItem.mutateAsync({
              foodName: l.detectedFoodName,
              caloriePer100g: macros.caloriePer100g,
              proteinPer100g: macros.proteinPer100g,
              carbohydratePer100g: macros.carbohydratePer100g,
              fatPer100g: macros.fatPer100g,
              sugarPer100g: macros.sugarPer100g,
              fiberPer100g: macros.fiberPer100g,
              creationSource: "aiAssistant",
            });
          } else if (target === "dish") {
            const dishRes = await createDish.mutateAsync({
              dishName: l.detectedFoodName,
            });
            await addDishLine.mutateAsync({
              dishId: dishRes.dish.id,
              data: {
                manualFoodName: l.detectedFoodName,
                manualCaloriePer100g: macros.caloriePer100g,
                manualProteinPer100g: macros.proteinPer100g,
                manualCarbohydratePer100g: macros.carbohydratePer100g,
                manualFatPer100g: macros.fatPer100g,
                manualSugarPer100g: macros.sugarPer100g,
                manualFiberPer100g: macros.fiberPer100g,
                gramAmount: l.estimatedGrams,
              },
            });
          }
        }
      }
      toast.success(t("aiSessionDetail.savedToLibrarySuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("aiSessionDetail.savedToLibraryError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("aiSessionDetail.saveToLibrary")}</DialogTitle>
          <DialogDescription>
            {t("aiSessionDetail.saveToLibraryHint")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={bulkMode}
              onChange={(e) => setBulkMode(e.target.checked)}
              className="rounded border-input"
            />
            {t("aiSessionDetail.saveAsBulkPreset")}
          </label>

          {bulkMode ? (
            <div>
              <Label className="mb-1.5">
                {t("aiSessionDetail.presetMealName")}
              </Label>
              <Input
                type="text"
                value={presetMealName}
                onChange={(e) => setPresetMealName(e.target.value)}
                placeholder={t("aiSessionDetail.presetMealNamePlaceholder")}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <span className="flex-1 text-sm text-foreground truncate">
                    {l.detectedFoodName}
                  </span>
                  <FlatPicker
                    className="w-40"
                    value={targets[l.id] ?? "food"}
                    onValueChange={(v) =>
                      setTargets((prev) => ({
                        ...prev,
                        [l.id]: v as LineTarget,
                      }))
                    }
                    options={[
                      { value: "food", label: t("aiSessionDetail.targetFood") },
                      { value: "dish", label: t("aiSessionDetail.targetDish") },
                      { value: "skip", label: t("aiSessionDetail.targetSkip") },
                    ]}
                  />
                </div>
              ))}
              {lines.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("aiSessionDetail.noCandidates")}
                </p>
              )}
            </div>
          )}

          <Button
            className="w-full gap-2"
            onClick={handleSave}
            disabled={saving || lines.length === 0}
          >
            {saving ? t("aiSessionDetail.savingLibrary") : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

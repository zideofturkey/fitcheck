import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
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

interface LineEdit {
  aiCandidateLineId: string;
  detectedFoodName: string;
  estimatedGrams: number;
  saveAsFood: boolean;
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
  const [mealDate, setMealDate] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [slotName, setSlotName] = useState("");

  // Seed editable state from the fetched data exactly once, via an effect
  // (not during render) so it can't clobber an in-progress edit.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!candidate || linesLoading) return;
    setLineEdits(
      lines.map((line) => ({
        aiCandidateLineId: line.id,
        detectedFoodName: line.detectedFoodName,
        estimatedGrams: line.estimatedGrams,
        saveAsFood: line.saveAsFood,
      })),
    );
    setMealDate(candidate.proposedMealDate ?? "");
    setMealTime(candidate.proposedMealTime ?? "");
    setSlotName(candidate.proposedSlotName ?? "");
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

  const updateLine = (lineId: string, patch: Partial<LineEdit>) => {
    setLineEdits((prev) =>
      prev.map((l) =>
        l.aiCandidateLineId === lineId ? { ...l, ...patch } : l,
      ),
    );
  };

  const handleConfirm = () => {
    confirmMutation.mutate(
      {
        aiCandidateMealId: candidate.id,
        data: {
          proposedMealDate: mealDate || undefined,
          proposedMealTime: mealTime || undefined,
          proposedSlotName: slotName || undefined,
          lineAdjustments: lineEdits.map((l) => ({
            aiCandidateLineId: l.aiCandidateLineId,
            estimatedGrams: l.estimatedGrams,
            saveAsFood: l.saveAsFood,
          })),
        },
      },
      {
        onSuccess: () =>
          navigate(
            candidate.committedMealLogId
              ? `/meals/${candidate.committedMealLogId}`
              : "/meals",
          ),
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <Label className="mb-1.5">{t("aiCandidateMeal.slot")}</Label>
              <Input
                type="text"
                value={slotName}
                onChange={(e) => setSlotName(e.target.value)}
              />
            </div>
          </div>
        )}

        {candidate.warningText && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠ {candidate.warningText}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
          {[
            [t("aiCandidateMeal.calories"), candidate.totalCalories, t("common.kcal")],
            [t("aiCandidateMeal.protein"), candidate.totalProtein, "g"],
            [t("aiCandidateMeal.carbs"), candidate.totalCarbohydrates, "g"],
            [t("aiCandidateMeal.fat"), candidate.totalFat, "g"],
            [t("aiCandidateMeal.sugar"), candidate.totalSugar, "g"],
            [t("aiCandidateMeal.fiber"), candidate.totalFiber, "g"],
          ].map(([label, value, unit]) => (
            <div key={label as string}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold">
                {(value as number | undefined) ?? "—"} {unit}
              </p>
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
                        updateLine(line.aiCandidateLineId, {
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
                        updateLine(line.aiCandidateLineId, {
                          estimatedGrams: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={line.saveAsFood}
                    onChange={(e) =>
                      updateLine(line.aiCandidateLineId, {
                        saveAsFood: e.target.checked,
                      })
                    }
                    className="rounded border-input"
                  />
                  <BookmarkPlus className="w-4 h-4" />
                  {t("aiCandidateMeal.saveAsFood")}
                </label>
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

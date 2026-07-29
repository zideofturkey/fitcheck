import { useTranslation } from "react-i18next";
import { Target, AlertTriangle, RefreshCw } from "lucide-react";
import {
  useGetMyMacroTarget,
  useSetMacroTarget,
} from "@/hooks/api/use-nutritionlibrary";
import MacroTargetForm from "@/components/MacroTargetForm";
import { Button } from "@/components/ui/button";

export default function TargetsPage() {
  const { t, i18n } = useTranslation();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyMacroTarget();
  const setMacroTarget = useSetMacroTarget();

  // A brand-new user has no macro target yet — the backend responds 404 in
  // that case, which is an expected empty state, not a real error.
  const notFound = (error as { httpStatus?: number } | null)?.httpStatus === 404;
  const macroTarget = data?.macroTarget;

  const initialTargets = macroTarget
    ? {
        calories: macroTarget.calorieTarget,
        protein: macroTarget.proteinTarget,
        carbohydrates: macroTarget.carbohydrateTarget,
        fat: macroTarget.fatTarget,
        sugar: macroTarget.sugarTarget,
        fiber: macroTarget.fiberTarget,
      }
    : null;

  const handleSave = async (targets: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    sugar: number;
    fiber: number;
  }) => {
    await setMacroTarget.mutateAsync({
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
      carbohydrateTarget: targets.carbohydrates,
      fatTarget: targets.fat,
      sugarTarget: targets.sugar,
      fiberTarget: targets.fiber,
    });
    // Cache invalidation alone doesn't retry a query that's already sitting
    // in error state (the initial 404 for a first-time user) — force it.
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          {t("targets.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("targets.subtitle")}</p>
      </header>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      ) : isError && !notFound ? (
        <div className="bg-card rounded-xl border border-destructive/30 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {t("targets.loadError")}
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm">
            {error?.message ?? ""}
          </p>
          <Button variant="default" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <MacroTargetForm
          initialTargets={initialTargets}
          onSave={handleSave}
          isPending={setMacroTarget.isPending}
          effectiveFrom={
            macroTarget?.effectiveFrom
              ? new Date(macroTarget.effectiveFrom).toLocaleDateString(
                  i18n.language,
                )
              : null
          }
        />
      )}
    </div>
  );
}

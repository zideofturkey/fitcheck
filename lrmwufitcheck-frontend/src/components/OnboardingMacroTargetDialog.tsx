import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/hooks/api/use-auth";
import {
  useGetMyMacroTarget,
  useSetMacroTarget,
} from "@/hooks/api/use-nutritionlibrary";
import MacroTargetForm from "@/components/MacroTargetForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DISMISSED_KEY_PREFIX = "fitcheck.onboardingMacroTargetDismissed.";

export default function OnboardingMacroTargetDialog() {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data, isError, error, isLoading, refetch } = useGetMyMacroTarget();
  const setMacroTarget = useSetMacroTarget();
  const [open, setOpen] = useState(false);

  const notFound = (error as { httpStatus?: number } | null)?.httpStatus === 404;
  const userId = currentUser?.userId;
  const dismissedKey = userId ? `${DISMISSED_KEY_PREFIX}${userId}` : null;

  useEffect(() => {
    if (isLoading || !dismissedKey) return;
    if (localStorage.getItem(dismissedKey)) return;
    setOpen(notFound || (!isError && !data?.macroTarget));
  }, [isLoading, isError, notFound, data, dismissedKey]);

  const dismiss = () => {
    if (dismissedKey) localStorage.setItem(dismissedKey, "1");
    setOpen(false);
  };

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
    if (dismissedKey) localStorage.setItem(dismissedKey, "1");
    await refetch();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("onboarding.title")}</DialogTitle>
          <DialogDescription>{t("onboarding.description")}</DialogDescription>
        </DialogHeader>
        <MacroTargetForm
          initialTargets={null}
          onSave={handleSave}
          isPending={setMacroTarget.isPending}
          effectiveFrom={null}
        />
        <p className="text-xs text-muted-foreground">
          {t("onboarding.skipNote")}
        </p>
      </DialogContent>
    </Dialog>
  );
}

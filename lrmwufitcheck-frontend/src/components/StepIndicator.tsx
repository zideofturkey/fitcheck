import { useTranslation } from "react-i18next";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Minimal progress indicator for multi-step modals/drawers: "Adım 1 / 2"
 * plus small dots. Deliberately lightweight (no icons/labels per step) so
 * it fits in a drawer header without crowding it.
 */
export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={t("stepIndicator.label", {
        current: currentStep,
        total: totalSteps,
      })}
    >
      <span className="text-xs font-medium text-muted-foreground">
        {t("stepIndicator.label", { current: currentStep, total: totalSteps })}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <span
            key={step}
            className={`h-1.5 rounded-full transition-all ${
              step === currentStep
                ? "w-4 bg-primary"
                : step < currentStep
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

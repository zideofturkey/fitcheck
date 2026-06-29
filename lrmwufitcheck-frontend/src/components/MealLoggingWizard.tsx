import * as React from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import MealSlotSelector from "@/components/MealSlotSelector";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface MealLineInput {
  itemName: string;
  consumedGrams: number;
  itemCalories: number;
  itemProtein: number;
  itemCarbohydrates: number;
}

interface MealLoggingWizardProps {
  steps: Array<{ label: string }>;
  currentStep: number;
  mealDate: Date;
  mealTime: string;
  slotName: string;
  customSlot: string;
  lines: MealLineInput[];
  isPending: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onSetMealDate: (d: Date) => void;
  onSetMealTime: (t: string) => void;
  onSetSlotName: (s: string) => void;
  onAddLine: () => void;
  onUpdateLine: (idx: number, field: string, value: any) => void;
  onRemoveLine: (idx: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSubmit: () => void;
}

/* ------------------------------------------------------------------ */
/*  Wizard Step Indicator (inline for simplicity)                     */
/* ------------------------------------------------------------------ */

const WizardStepIndicator: React.FC<{
  steps: Array<{ label: string }>;
  currentStep: number;
}> = ({ steps, currentStep }) => (
  <nav aria-label="Progress" className="flex items-center gap-2">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              i + 1 === currentStep
                ? "bg-primary text-primary-foreground"
                : i + 1 < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
            aria-current={i + 1 === currentStep ? "step" : undefined}
          >
            {i + 1 < currentStep ? <Icons.Check size={14} /> : i + 1}
          </span>
          <span
            className={`text-xs font-medium ${
              i + 1 === currentStep
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`h-px w-6 ${
              i + 1 < currentStep ? "bg-primary/50" : "bg-border"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </nav>
);

/* ------------------------------------------------------------------ */
/*  Meal Totals Summary (running)                                     */
/* ------------------------------------------------------------------ */

const getTotal = (lines: MealLineInput[]) => ({
  totalCalories: lines.reduce((sum, l) => sum + (l.itemCalories || 0), 0),
  totalProtein: lines.reduce((sum, l) => sum + (l.itemProtein || 0), 0),
  totalFat: lines.reduce((sum, l) => sum + ((l as any).itemFat || 0), 0),
});

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function MealLoggingWizard({
  steps,
  currentStep,
  mealDate,
  mealTime,
  slotName,
  customSlot,
  lines,
  isPending,
  isFirstStep,
  isLastStep,
  onSetMealDate,
  onSetMealTime,
  onSetSlotName,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onNextStep,
  onPrevStep,
  onSubmit,
}: MealLoggingWizardProps) {
  const totals = getTotal(lines);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetMealTime(e.target.value);
  };

  const handleCustomSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* customSlot is managed by parent via onSetSlotName with custom value pattern */
    onSetSlotName(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <WizardStepIndicator steps={steps} currentStep={currentStep} />

      {/* Step panel */}
      <div className="rounded-lg border p-4">
        {currentStep === 1 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Tarih</label>
            {/* Calendar component model changed to fix TS errors */}
            <Calendar
              mode="single"
              selected={mealDate}
              onSelect={(d) => {
                if (d) onSetMealDate(d);
              }}
            />

            <label htmlFor="meal-time" className="text-sm font-medium">
              Saat
            </label>
            <Input
              id="meal-time"
              type="time"
              value={mealTime}
              onChange={handleTimeChange}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Öğün</label>
            {/* slot name is managed via MealSlotSelector which expects value & onChange */}
            <MealSlotSelector
              breakfastLabel="Kahvaltı"
              lunchLabel="Öğle"
              dinnerLabel="Akşam"
              snackLabel="Ara Öğün"
              value={slotName}
              onValueChange={onSetSlotName}
            />
            {slotName === "custom" && (
              <Input
                placeholder="Özel öğün adı"
                value={customSlot}
                onChange={handleCustomSlotChange}
              />
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Besinler</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddLine}
                type="button"
              >
                Besin ekle
              </Button>
            </div>

            {lines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-md border p-2"
              >
                <div className="flex-1">
                  <Input
                    placeholder="Besin adı"
                    value={line.itemName}
                    onChange={(e) =>
                      onUpdateLine(idx, "itemName", e.target.value)
                    }
                    className="mb-1"
                  />

                  <div className="grid grid-cols-4 gap-1">
                    <Input
                      placeholder="Gram"
                      type="number"
                      value={line.consumedGrams ?? ""}
                      onChange={(e) =>
                        onUpdateLine(
                          idx,
                          "consumedGrams",
                          Number(e.target.value),
                        )
                      }
                    />
                    <Input
                      placeholder="Kalori"
                      type="number"
                      value={line.itemCalories ?? ""}
                      onChange={(e) =>
                        onUpdateLine(
                          idx,
                          "itemCalories",
                          Number(e.target.value),
                        )
                      }
                    />
                    <Input
                      placeholder="Protein"
                      type="number"
                      value={line.itemProtein ?? ""}
                      onChange={(e) =>
                        onUpdateLine(idx, "itemProtein", Number(e.target.value))
                      }
                    />
                    <Input
                      placeholder="Karbonhidrat"
                      type="number"
                      value={line.itemCarbohydrates ?? ""}
                      onChange={(e) =>
                        onUpdateLine(
                          idx,
                          "itemCarbohydrates",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveLine(idx)}
                  type="button"
                  aria-label={`${line.itemName || "satır"} kaldır`}
                >
                  <Icons.X size={14} />
                </Button>
              </div>
            ))}

            {/* Running summary */}
            <div className="rounded-md bg-muted/50 p-3">
              <h5 className="text-xs font-medium text-muted-foreground">
                Öğün toplamı
              </h5>
              <div className="mt-1 grid grid-cols-3 gap-1 text-xs">
                <span>Kalori: {totals.totalCalories}</span>
                <span>Protein: {totals.totalProtein}g</span>
                <span>Yağ: {totals.totalFat}g</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={isFirstStep}
          onClick={onPrevStep}
          type="button"
        >
          Geri
        </Button>

        {isLastStep ? (
          <Button onClick={onSubmit} disabled={isPending} type="button">
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        ) : (
          <Button onClick={onNextStep} type="button">
            İleri
          </Button>
        )}
      </div>
    </div>
  );
}

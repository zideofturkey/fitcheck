import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ManualNutritionFormValues {
  name: string;
  caloriePer100g: number;
  proteinPer100g: number;
  carbohydratePer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
  fiberPer100g: number;
  gramAmount: number;
}

interface ManualNutritionFormProps {
  onSubmit: (values: ManualNutritionFormValues) => void;
  isPending?: boolean;
  nameLabel: string;
  submitLabel: string;
  initialValues?: ManualNutritionFormValues;
}

const emptyForm = {
  name: "",
  caloriePer100g: "",
  proteinPer100g: "",
  carbohydratePer100g: "",
  fatPer100g: "",
  sugarPer100g: "",
  fiberPer100g: "",
  gramAmount: "100",
};

function toFormState(values: ManualNutritionFormValues) {
  return {
    name: values.name,
    caloriePer100g: String(values.caloriePer100g),
    proteinPer100g: String(values.proteinPer100g),
    carbohydratePer100g: String(values.carbohydratePer100g),
    fatPer100g: String(values.fatPer100g),
    sugarPer100g: String(values.sugarPer100g),
    fiberPer100g: String(values.fiberPer100g),
    gramAmount: String(values.gramAmount),
  };
}

export default function ManualNutritionForm({
  onSubmit,
  isPending,
  nameLabel,
  submitLabel,
  initialValues,
}: ManualNutritionFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(
    initialValues ? toFormState(initialValues) : emptyForm,
  );

  const num = (v: string) => Number(v.replace(",", ".")) || 0;
  const isValid = form.name.trim().length > 0 && num(form.gramAmount) > 0;
  const grams = num(form.gramAmount);
  const scale = (per100g: number) =>
    grams > 0 ? +((per100g / 100) * grams).toFixed(1) : 0;
  const hasAnyValue =
    grams > 0 &&
    (num(form.caloriePer100g) > 0 ||
      num(form.proteinPer100g) > 0 ||
      num(form.carbohydratePer100g) > 0 ||
      num(form.fatPer100g) > 0 ||
      num(form.sugarPer100g) > 0 ||
      num(form.fiberPer100g) > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      name: form.name.trim(),
      caloriePer100g: toPer100g(num(form.caloriePer100g)),
      proteinPer100g: toPer100g(num(form.proteinPer100g)),
      carbohydratePer100g: toPer100g(num(form.carbohydratePer100g)),
      fatPer100g: toPer100g(num(form.fatPer100g)),
      sugarPer100g: toPer100g(num(form.sugarPer100g)),
      fiberPer100g: toPer100g(num(form.fiberPer100g)),
      gramAmount: num(form.gramAmount),
    });
    setForm(emptyForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">{nameLabel} *</label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("manualEntry.per100gHint")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            {t("manualEntry.calories")}
          </label>
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={0}
            value={form.caloriePer100g}
            onChange={(e) =>
              setForm((f) => ({ ...f, caloriePer100g: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            {t("manualEntry.protein")}
          </label>
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={0}
            value={form.proteinPer100g}
            onChange={(e) =>
              setForm((f) => ({ ...f, proteinPer100g: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            {t("manualEntry.carbs")}
          </label>
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={0}
            value={form.carbohydratePer100g}
            onChange={(e) =>
              setForm((f) => ({ ...f, carbohydratePer100g: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            {t("manualEntry.fat")}
          </label>
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={0}
            value={form.fatPer100g}
            onChange={(e) =>
              setForm((f) => ({ ...f, fatPer100g: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            {t("manualEntry.sugar")}
          </label>
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={0}
            value={form.sugarPer100g}
            onChange={(e) =>
              setForm((f) => ({ ...f, sugarPer100g: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            {t("manualEntry.fiber")}
          </label>
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={0}
            value={form.fiberPer100g}
            onChange={(e) =>
              setForm((f) => ({ ...f, fiberPer100g: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          {t("manualEntry.gramAmount")}
        </label>
        <div className="relative">
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            min={1}
            value={form.gramAmount}
            onChange={(e) =>
              setForm((f) => ({ ...f, gramAmount: e.target.value }))
            }
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            g
          </span>
        </div>
      </div>
      {hasAnyValue && (
        <div className="rounded-md border border-border bg-muted/30 p-2.5 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("manualEntry.computedForGrams", { grams })}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">
                {t("manualEntry.calories")}
              </span>
              <p className="font-semibold text-foreground">
                {scale(num(form.caloriePer100g))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("manualEntry.protein")}
              </span>
              <p className="font-semibold text-foreground">
                {scale(num(form.proteinPer100g))}g
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("manualEntry.carbs")}
              </span>
              <p className="font-semibold text-foreground">
                {scale(num(form.carbohydratePer100g))}g
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("manualEntry.fat")}
              </span>
              <p className="font-semibold text-foreground">
                {scale(num(form.fatPer100g))}g
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("manualEntry.sugar")}
              </span>
              <p className="font-semibold text-foreground">
                {scale(num(form.sugarPer100g))}g
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("manualEntry.fiber")}
              </span>
              <p className="font-semibold text-foreground">
                {scale(num(form.fiberPer100g))}g
              </p>
            </div>
          </div>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={!isValid || isPending}>
        {isPending ? t("manualEntry.adding") : submitLabel}
      </Button>
    </form>
  );
}

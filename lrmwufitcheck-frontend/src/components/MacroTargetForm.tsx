import { useState, useEffect } from "react";
import { Calendar, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface MacroTargets {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sugar: number;
  fiber: number;
}

interface MacroTargetFormProps {
  initialTargets: MacroTargets | null;
  onSave: (targets: MacroTargets) => Promise<void>;
  isPending: boolean;
  effectiveFrom: string | null;
}

const defaultTargets: MacroTargets = {
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  sugar: 0,
  fiber: 0,
};

export default function MacroTargetForm({
  initialTargets,
  onSave,
  isPending,
  effectiveFrom,
}: MacroTargetFormProps) {
  const { t } = useTranslation();
  const [targets, setTargets] = useState<MacroTargets>(
    initialTargets ?? defaultTargets,
  );

  useEffect(() => {
    if (initialTargets) {
      setTargets(initialTargets);
    }
  }, [initialTargets]);

  const handleChange =
    (field: keyof MacroTargets) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const value = parseFloat(raw);
      setTargets((prev) => ({
        ...prev,
        [field]: raw === "" || isNaN(value) ? 0 : value,
      }));
    };

  // Render 0 as a blank field (with a "0" placeholder) rather than the
  // literal digit - otherwise the user has to delete the pre-filled zero
  // before they can type a real value, which is a common complaint on
  // number inputs that default to 0.
  const displayValue = (n: number) => (n === 0 ? "" : n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(targets);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("targets.formTitle")}
              </CardTitle>
              {effectiveFrom ? (
                <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("targets.updatedOn", { date: effectiveFrom })}
                </CardDescription>
              ) : (
                <CardDescription className="text-sm text-muted-foreground">
                  {t("targets.noTargetsYet")}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-medium">
                {t("targets.calories")}
              </Label>
              <Input
                id="calories"
                type="number"
                value={displayValue(targets.calories)}
                onChange={handleChange("calories")}
                placeholder="0"
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-medium">
                {t("targets.protein")}
              </Label>
              <Input
                id="protein"
                type="number"
                value={displayValue(targets.protein)}
                onChange={handleChange("protein")}
                placeholder="0"
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbohydrates" className="text-sm font-medium">
                {t("targets.carbohydrates")}
              </Label>
              <Input
                id="carbohydrates"
                type="number"
                value={displayValue(targets.carbohydrates)}
                onChange={handleChange("carbohydrates")}
                placeholder="0"
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm font-medium">
                {t("targets.fat")}
              </Label>
              <Input
                id="fat"
                type="number"
                value={displayValue(targets.fat)}
                onChange={handleChange("fat")}
                placeholder="0"
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sugar" className="text-sm font-medium">
                {t("targets.sugar")}
              </Label>
              <Input
                id="sugar"
                type="number"
                value={displayValue(targets.sugar)}
                onChange={handleChange("sugar")}
                placeholder="0"
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-sm font-medium">
                {t("targets.fiber")}
              </Label>
              <Input
                id="fiber"
                type="number"
                value={displayValue(targets.fiber)}
                onChange={handleChange("fiber")}
                placeholder="0"
                min="0"
                step="any"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                {t("targets.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("targets.saveTargets")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

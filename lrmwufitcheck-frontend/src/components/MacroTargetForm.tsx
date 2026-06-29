import { useState, useEffect } from "react";
import { Calendar, Save } from "lucide-react";
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
      const value = parseFloat(e.target.value);
      setTargets((prev) => ({
        ...prev,
        [field]: isNaN(value) ? 0 : value,
      }));
    };

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
                Daily Macro Targets
              </CardTitle>
              {effectiveFrom ? (
                <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Updated on {effectiveFrom}
                </CardDescription>
              ) : (
                <CardDescription className="text-sm text-muted-foreground">
                  No targets set yet
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-medium">
                Calories (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                value={targets.calories}
                onChange={handleChange("calories")}
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-medium">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={targets.protein}
                onChange={handleChange("protein")}
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbohydrates" className="text-sm font-medium">
                Carbs (g)
              </Label>
              <Input
                id="carbohydrates"
                type="number"
                value={targets.carbohydrates}
                onChange={handleChange("carbohydrates")}
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm font-medium">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                value={targets.fat}
                onChange={handleChange("fat")}
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sugar" className="text-sm font-medium">
                Sugar (g)
              </Label>
              <Input
                id="sugar"
                type="number"
                value={targets.sugar}
                onChange={handleChange("sugar")}
                min="0"
                step="any"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-sm font-medium">
                Fiber (g)
              </Label>
              <Input
                id="fiber"
                type="number"
                value={targets.fiber}
                onChange={handleChange("fiber")}
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
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Targets
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2, Plus, X } from "lucide-react";

interface PresetLine {
  id: string;
  foodName: string;
  gramAmount: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    fiber: number;
  };
}

interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}

interface PresetMeal {
  id: string;
  templateName: string;
  description?: string;
  nutritionSummary: NutritionSummary;
}

export interface PresetMealDetailViewProps {
  presetMeal: PresetMeal;
  lines: PresetLine[];
  onEdit: () => void;
  onDelete: () => void;
  onAddLine: () => void;
  onDeleteLine: (lineId: string) => void;
  isPending?: boolean;
}

const PresetMealDetailView: React.FC<PresetMealDetailViewProps> = ({
  presetMeal,
  lines,
  onEdit,
  onDelete,
  onAddLine,
  onDeleteLine,
  isPending = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {presetMeal.templateName}
              </CardTitle>
              {presetMeal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {presetMeal.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                disabled={isPending}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          {/* Nutrition Summary */}
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-sm">
              <strong>Calories:</strong> {presetMeal.nutritionSummary.calories}{" "}
              kcal
            </span>
            <span className="text-sm">
              <strong>Protein:</strong> {presetMeal.nutritionSummary.protein}g
            </span>
            <span className="text-sm">
              <strong>Carbs:</strong> {presetMeal.nutritionSummary.carbs}g
            </span>
            <span className="text-sm">
              <strong>Fat:</strong> {presetMeal.nutritionSummary.fat}g
            </span>
            <span className="text-sm">
              <strong>Sugar:</strong> {presetMeal.nutritionSummary.sugar}g
            </span>
            <span className="text-sm">
              <strong>Fiber:</strong> {presetMeal.nutritionSummary.fiber}g
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lines Table */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Food Items</h4>
        {/* Column Headers */}
        <div className="flex items-center justify-between border-b pb-2 text-sm text-muted-foreground">
          <span className="flex-1">Food Name</span>
          <span className="w-20 text-right">Grams</span>
          <span className="w-16 text-right">Cal</span>
          <span className="w-16 text-right">P</span>
          <span className="w-16 text-right">C</span>
          <span className="w-16 text-right">F</span>
          <span className="w-12" />
        </div>
        {/* Line Rows */}
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No food items added yet.
          </p>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="flex-1">{line.foodName}</span>
              <span className="w-20 text-right">{line.gramAmount}g</span>
              <span className="w-16 text-right">{line.nutrition.calories}</span>
              <span className="w-16 text-right">{line.nutrition.protein}</span>
              <span className="w-16 text-right">{line.nutrition.carbs}</span>
              <span className="w-16 text-right">{line.nutrition.fat}</span>
              <span className="w-12 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDeleteLine(line.id)}
                  disabled={isPending}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add Food Button */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddLine}
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Food
        </Button>
      </div>
    </div>
  );
};

export default PresetMealDetailView;

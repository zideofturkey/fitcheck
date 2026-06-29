import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Utensils } from "lucide-react";

// --- TypeScript Interfaces ---
// Assuming MealLog and MealLine types are available from api.ts; define loosely for component isolation
interface MealLog {
  id: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  slotName: string;
  logSource: string;
  noteText?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
}

interface MealLine {
  itemName: string;
  consumedGrams: number;
  itemCalories: number;
  itemProtein: number;
  itemCarbohydrates: number;
  itemFat: number;
}

interface DateGroup {
  dateLabel: string;
  meals: {
    meal: MealLog;
    lines: MealLine[];
    expanded: boolean;
  }[];
}

interface DateGroupedMealListProps {
  dateGroups: DateGroup[];
  noMeals: boolean;
  onToggleExpand: (mealId: string) => void;
  onAddMeal: () => void;
}

// Helper to generate source badge color classes
const getSourceColorClass = (source: string): string => {
  const lower = source.toLowerCase();
  if (lower.includes("manuel") || lower.includes("manual")) {
    return "bg-blue-100 text-blue-700";
  }
  if (
    lower.includes("kütüphane") ||
    lower.includes("library") ||
    lower.includes("food")
  ) {
    return "bg-green-100 text-green-700";
  }
  if (
    lower.includes("fotoğraf") ||
    lower.includes("photo") ||
    lower.includes("image")
  ) {
    return "bg-purple-100 text-purple-700";
  }
  return "bg-slate-100 text-slate-700";
};

const DateGroupedMealList: React.FC<DateGroupedMealListProps> = ({
  dateGroups,
  noMeals,
  onToggleExpand,
  onAddMeal,
}) => {
  if (noMeals) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Utensils className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Henüz yemek kaydedilmedi
        </p>
        <Button
          variant="link"
          className="mt-2 text-sm text-primary p-0 h-auto"
          onClick={onAddMeal}
        >
          <Plus className="mr-1 h-4 w-4" />
          Yemek ekle
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {dateGroups.map((group) => (
        <div key={group.dateLabel}>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {group.dateLabel}
          </h3>
          <div className="flex flex-col gap-2">
            {group.meals.map((mealGroup) => (
              <div key={mealGroup.meal.id} className="rounded-lg border p-3">
                {/* Header: Slot, Time, Source */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      {mealGroup.meal.slotName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {mealGroup.meal.time?.substring(0, 5)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getSourceColorClass(mealGroup.meal.logSource)}`}
                  >
                    {mealGroup.meal.logSource}
                  </span>
                </div>

                {/* Macro Summary */}
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {mealGroup.meal.totalCalories} kcal
                  </span>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>P:{mealGroup.meal.totalProtein}g</span>
                    <span>K:{mealGroup.meal.totalCarbohydrates}g</span>
                    <span>Y:{mealGroup.meal.totalFat}g</span>
                  </div>
                </div>

                {/* Optional Note */}
                {mealGroup.meal.noteText && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mealGroup.meal.noteText}
                  </p>
                )}

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => onToggleExpand(mealGroup.meal.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none"
                >
                  {mealGroup.expanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {mealGroup.expanded ? "Detayları gizle" : "Detayları göster"}
                </button>

                {/* Expanded Meal Lines Table */}
                {mealGroup.expanded && (
                  <div className="mt-2 border-t pt-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left font-medium">Besin</th>
                          <th className="font-medium">Gram</th>
                          <th className="font-medium">Kalori</th>
                          <th className="font-medium">P</th>
                          <th className="font-medium">K</th>
                          <th className="font-medium">Y</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mealGroup.lines.map((line, idx) => (
                          <tr
                            key={`${mealGroup.meal.id}-line-${idx}`}
                            className="border-t"
                          >
                            <td className="py-1">{line.itemName}</td>
                            <td className="text-center">
                              {line.consumedGrams}g
                            </td>
                            <td className="text-center">{line.itemCalories}</td>
                            <td className="text-center">{line.itemProtein}</td>
                            <td className="text-center">
                              {line.itemCarbohydrates}
                            </td>
                            <td className="text-center">{line.itemFat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DateGroupedMealList;

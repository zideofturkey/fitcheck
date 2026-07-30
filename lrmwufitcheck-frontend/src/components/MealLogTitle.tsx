import { useQueries } from "@tanstack/react-query";
import { useListMealLines } from "@/hooks/api/use-mealtracker";
import { dishService } from "@/services/api/dish-api";
import { nutritionlibraryService } from "@/services/api/nutritionlibrary-api";
import type { MealLineWithDish } from "@/types/meal-line-extensions";

interface MealLogTitleProps {
  mealLogId: string;
  className?: string;
}

type Segment =
  | { kind: "preset"; presetMealId: string; fallback: string }
  | { kind: "dish"; dishId: string; fallback: string }
  | { kind: "line"; label: string };

/**
 * Builds the "X + Y" title for a logged meal from its mealLines. A line
 * logged from a Preset Meal or a Dish only carries the name of the
 * individual ingredient it snapshotted (itemName) - not the template's own
 * name - so those lines are grouped by sourcePresetMealId/sourceDishId and
 * resolved to the template's real name via one lookup per distinct
 * template. Lines with neither (foodLibrary/manualEntry/aiAssistant) show
 * their own itemName directly, one segment per line.
 */
export default function MealLogTitle({
  mealLogId,
  className,
}: MealLogTitleProps) {
  const { data, isLoading } = useListMealLines({ mealLogId });
  const lines = (data?.mealLines ?? []) as MealLineWithDish[];

  const segments: Segment[] = [];
  const seenGroups = new Set<string>();
  for (const line of lines) {
    if (line.sourcePresetMealId) {
      const key = `preset:${line.sourcePresetMealId}`;
      if (seenGroups.has(key)) continue;
      seenGroups.add(key);
      segments.push({
        kind: "preset",
        presetMealId: line.sourcePresetMealId,
        fallback: line.itemName,
      });
    } else if (line.sourceDishId) {
      const key = `dish:${line.sourceDishId}`;
      if (seenGroups.has(key)) continue;
      seenGroups.add(key);
      segments.push({
        kind: "dish",
        dishId: line.sourceDishId,
        fallback: line.itemName,
      });
    } else {
      segments.push({ kind: "line", label: line.itemName });
    }
  }

  const presetIds = segments
    .filter((s): s is Extract<Segment, { kind: "preset" }> => s.kind === "preset")
    .map((s) => s.presetMealId);
  const dishIds = segments
    .filter((s): s is Extract<Segment, { kind: "dish" }> => s.kind === "dish")
    .map((s) => s.dishId);

  const nameQueries = useQueries({
    queries: [
      ...presetIds.map((id) => ({
        queryKey: ["mealLogTitle", "presetMeal", id],
        queryFn: () =>
          nutritionlibraryService
            .getPresetMeal(id)
            .then((r) => r.presetMeal?.templateName),
        staleTime: 5 * 60 * 1000,
      })),
      ...dishIds.map((id) => ({
        queryKey: ["mealLogTitle", "dish", id],
        queryFn: () => dishService.getDish(id).then((r) => r.dish?.dishName),
        staleTime: 5 * 60 * 1000,
      })),
    ],
  });

  if (isLoading || lines.length === 0) return null;

  let queryIdx = 0;
  const resolvedLabels = segments.map((segment) => {
    if (segment.kind === "line") return segment.label;
    const resolved = nameQueries[queryIdx++]?.data;
    return resolved || segment.fallback;
  });

  const title = resolvedLabels.filter(Boolean).join(" + ");
  if (!title) return null;

  return (
    <p className={className ?? "text-sm font-medium text-foreground truncate"}>
      {title}
    </p>
  );
}

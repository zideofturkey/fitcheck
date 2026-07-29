import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useListDishes } from "@/hooks/api/use-dish";
import { DISH_CATEGORIES, dishCategoryLabel } from "@/lib/dish-category";
import type { Dish } from "@/services/api/dish-api";

interface CategoryAccordionDishPickerProps {
  selectedId: string | null;
  onSelect: (dish: Dish) => void;
  emptyLabel: string;
}

/**
 * Groups the caller's Dishes by dishCategory (accordion, one section per
 * category). Dishes don't have brand variants (that's a foodItem-only
 * concept), so this is a single grouping level, unlike
 * CategoryAccordionFoodPicker. Only shown when the picker's search box is
 * empty; a non-empty search falls back to the flat searchTerm-filtered
 * list instead (see PresetMealsPage).
 */
export default function CategoryAccordionDishPicker({
  selectedId,
  onSelect,
  emptyLabel,
}: CategoryAccordionDishPickerProps) {
  const { t } = useTranslation();
  // No dedicated "grouped" endpoint for dishes - fetch a generously large
  // page and bucket client-side, matching how the foodItem picker consumes
  // its (already-complete) /v1/food-items/grouped response.
  const { data, isLoading } = useListDishes({ pageRowCount: 200 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Loader className="w-4 h-4 animate-spin mr-2" />
        {t("common.loading")}
      </div>
    );
  }

  const dishes = data?.dishes ?? [];
  if (dishes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {emptyLabel}
      </p>
    );
  }

  const byCategory = new Map<string, Dish[]>();
  for (const dish of dishes) {
    const cat = dish.dishCategory || "__uncategorized";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(dish);
  }

  const orderedCategories = [
    ...DISH_CATEGORIES.filter((c) => byCategory.has(c)),
    ...(byCategory.has("__uncategorized") ? ["__uncategorized"] : []),
  ];

  return (
    <Accordion type="multiple" className="space-y-2">
      {orderedCategories.map((cat) => {
        const catDishes = byCategory.get(cat) ?? [];
        return (
          <AccordionItem
            key={cat}
            value={cat}
            className="rounded-md border border-border px-3"
          >
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              {cat === "__uncategorized"
                ? t("dishes.categories.other")
                : dishCategoryLabel(t, cat)}{" "}
              <span className="text-xs text-muted-foreground ml-1">
                ({catDishes.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {catDishes.map((dish) => {
                const isSelected = selectedId === dish.id;
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => onSelect(dish)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium">{dish.dishName}</p>
                    <p className="text-xs text-muted-foreground">
                      {dish.totalCalories} kcal / {dish.totalGramWeight}g
                    </p>
                  </button>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Loader } from "lucide-react";
import { useGroupedFoodItems } from "@/hooks/api/use-food-item-groups";
import { CATEGORIES, categoryLabel } from "@/lib/food-category";
import type { FoodItemWithBaseName } from "@/types/food-item-extensions";

interface CategoryAccordionFoodPickerProps {
  selectedId: string | null;
  onSelect: (food: FoodItemWithBaseName) => void;
  emptyLabel: string;
}

/**
 * Groups the caller's foodItems by foodCategory (one collapsible section per
 * category), and within each category by baseName (brand variants) -
 * reusing the existing /v1/food-items/grouped endpoint, which already
 * returns each item's foodCategory and baseName grouping. Only shown when
 * the picker's search box is empty; a non-empty search falls back to the
 * flat searchTerm-filtered list instead (see DishesPage/PresetMealsPage).
 *
 * Deliberately NOT built on Radix's Accordion: its content panel freezes
 * its height (via a CSS var) at the moment it opens. Expanding a brand-variant
 * group *inside* an already-open category panel grows the DOM without that
 * frozen height ever being recalculated, silently clipping the extra rows
 * behind `overflow-hidden` - some categories showed only one brand of a
 * multi-brand ingredient because of exactly this. Plain state + conditional
 * rendering has no fixed height to go stale.
 */
export default function CategoryAccordionFoodPicker({
  selectedId,
  onSelect,
  emptyLabel,
}: CategoryAccordionFoodPickerProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useGroupedFoodItems(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  // Which baseName (brand-variant) group is currently expanded - a group's
  // brand list only appears after the user picks the base ingredient first,
  // never shown alongside it up front.
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Loader className="w-4 h-4 animate-spin mr-2" />
        {t("common.loading")}
      </div>
    );
  }

  const groups = data?.groups ?? [];
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {emptyLabel}
      </p>
    );
  }

  const byCategory = new Map<string, typeof groups>();
  for (const group of groups) {
    const cat = group.items[0]?.foodCategory || "__uncategorized";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(group);
  }

  const orderedCategories = [
    ...CATEGORIES.filter((c) => byCategory.has(c)),
    ...(byCategory.has("__uncategorized") ? ["__uncategorized"] : []),
  ];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const renderItemButton = (item: FoodItemWithBaseName) => {
    const isSelected = selectedId === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item)}
        className={`w-full text-left rounded-md border p-3 transition-colors ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted"
        }`}
      >
        <p className="text-sm font-medium">{item.foodName}</p>
        {item.brandName && (
          <p className="text-[11px] text-muted-foreground/70">
            {item.brandName}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {item.caloriePer100g} {t("common.kcal")} · {item.proteinPer100g}g
          {" "}
          {t("aiCandidateMeal.protein").toLowerCase()} / 100g
        </p>
      </button>
    );
  };

  return (
    <div className="space-y-2">
      {orderedCategories.map((cat) => {
        const catGroups = byCategory.get(cat) ?? [];
        const itemCount = catGroups.reduce((n, g) => n + g.items.length, 0);
        const isCategoryOpen = expandedCategories.has(cat);
        return (
          <div key={cat} className="rounded-md border border-border">
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span>
                {cat === "__uncategorized"
                  ? t("foodLibrary.categories.other")
                  : categoryLabel(t, cat)}{" "}
                <span className="text-xs text-muted-foreground ml-1">
                  ({itemCount})
                </span>
              </span>
              <ChevronDown
                className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isCategoryOpen && (
              <div className="px-3 pb-3 space-y-2">
                {catGroups.map((group, idx) => {
                  // Single-brand ingredients still go through the two-step
                  // (generic name -> brand) flow as long as a baseName exists
                  // - skipping straight to the raw item here was showing the
                  // brand name alone (e.g. "Tahsildaroğlu") with no generic
                  // ingredient label (e.g. "Kaşar Peyniri") anywhere, making
                  // it impossible to tell what was actually being added. Only
                  // a true singleton with no baseName at all (never grouped)
                  // renders directly, since there's no generic label to show.
                  if (group.items.length <= 1 && !group.baseName) {
                    return renderItemButton(group.items[0]);
                  }
                  const groupKey = group.baseName ?? String(idx);
                  const isExpanded = expandedGroup === groupKey;
                  const sortedItems = [...group.items].sort((a, b) =>
                    (a.brandName || a.foodName).localeCompare(
                      b.brandName || b.foodName,
                    ),
                  );
                  return (
                    <div key={groupKey} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroup(isExpanded ? null : groupKey)
                        }
                        className="w-full flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted"
                      >
                        <span className="text-sm font-medium">
                          {group.baseName}
                        </span>
                        <ChevronRight
                          className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isExpanded && (
                        <div className="space-y-1.5 pl-3">
                          {sortedItems.map(renderItemButton)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

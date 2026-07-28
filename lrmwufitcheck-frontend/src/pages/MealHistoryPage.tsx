import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Eye,
  Layers,
  Loader,
  Moon,
  Pencil,
  Plus,
  RotateCw,
  Sparkles,
  StickyNote,
  Sun,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useDeleteMealLog, useListMealLogs } from "@/hooks/api/use-mealtracker";
import type { MealtrackerMealLog } from "@/types/api";

type MealSource = MealtrackerMealLog["logSource"];

const SLOT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatGroupHeader(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MealHistoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  void queryClient;
  const [page, setPage] = useState(1);
  const [mobileDateFilter, setMobileDateFilter] = useState<string>("last7");
  const [fromDate, setFromDate] = useState(isoDaysAgo(7));
  const [toDate, setToDate] = useState(isoToday());
  const [sourceFilter, setSourceFilter] = useState<string>("");

  const SOURCE_STYLE: Record<
    string,
    {
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      cls: string;
    }
  > = {
    foodLibrary: {
      icon: Layers,
      label: t("mealHistory.librarySource"),
      cls: "bg-secondary text-secondary-foreground",
    },
    presetTemplate: {
      icon: Layers,
      label: t("mealHistory.presetSource"),
      cls: "bg-accent/30 text-accent-foreground",
    },
    dishTemplate: {
      icon: Layers,
      label: t("dashboard.sourceDish"),
      cls: "bg-pink-100 text-pink-700",
    },
    manualEntry: {
      icon: Pencil,
      label: t("mealHistory.manualSource"),
      cls: "bg-muted text-muted-foreground",
    },
    aiAssistant: {
      icon: Sparkles,
      label: t("mealHistory.aiSource"),
      cls: "bg-chart-3/20 text-chart-3",
    },
  };

  const params = useMemo(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      logSource: (sourceFilter || undefined) as MealSource | undefined,
      pageNumber: page,
      pageRowCount: 10,
    }),
    [fromDate, toDate, sourceFilter, page],
  );

  const { data, isLoading } = useListMealLogs(params);
  const deleteMutation = useDeleteMealLog();

  const meals = data?.mealLogs ?? [];
  const totalCount = data?.rowCount ?? meals.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  // Group meals by date
  const grouped = useMemo(() => {
    const groups = new Map<string, MealtrackerMealLog[]>();
    for (const m of meals) {
      const list = groups.get(m.mealDate) ?? [];
      list.push(m);
      groups.set(m.mealDate, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [meals]);

  const mobileFilters = [
    { key: "today", label: t("mealHistory.today") },
    { key: "yesterday", label: t("mealHistory.yesterday") },
    { key: "last7", label: t("mealHistory.last7Days") },
    { key: "last30", label: t("mealHistory.last30Days") },
  ];

  const setMobileRange = (range: string) => {
    setMobileDateFilter(range);
    if (range === "today") {
      setFromDate(isoToday());
      setToDate(isoToday());
    } else if (range === "yesterday") {
      const y = isoDaysAgo(1);
      setFromDate(y);
      setToDate(y);
    } else if (range === "last7") {
      setFromDate(isoDaysAgo(7));
      setToDate(isoToday());
    } else if (range === "last30") {
      setFromDate(isoDaysAgo(30));
      setToDate(isoToday());
    }
    setPage(1);
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("mealHistory.deleteConfirm"))) return;
    deleteMutation.mutate(id);
  };

  return (
    <section className="@container">
      <header className="relative mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("mealHistory.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("mealHistory.subtitle")}
          </p>
        </div>
        <Link
          to="/meals/log"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          {t("mealHistory.logMeal")}
        </Link>
      </header>

      {/* Mobile filter pills */}
      <div
        className="md:hidden mb-5 overflow-x-auto"
        style={
          {
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center gap-2 min-w-max pb-1">
          {mobileFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setMobileRange(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                mobileDateFilter === f.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground font-medium"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop filter row */}
      <div className="hidden md:flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="bg-transparent text-sm text-foreground outline-none w-32"
            aria-label={t("mealHistory.fromDate")}
          />
          <span className="text-sm text-muted-foreground">–</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="bg-transparent text-sm text-foreground outline-none w-32"
            aria-label={t("mealHistory.toDate")}
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          aria-label={t("mealHistory.filterBySource")}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        >
          <option value="">{t("mealHistory.allSources")}</option>
          <option value="foodLibrary">
            {t("mealHistory.sourceFoodLibrary")}
          </option>
          <option value="presetTemplate">
            {t("mealHistory.sourcePresetTemplate")}
          </option>
          <option value="manualEntry">
            {t("mealHistory.sourceManualEntry")}
          </option>
          <option value="aiAssistant">
            {t("mealHistory.sourceAiAssistant")}
          </option>
        </select>
        <button
          type="button"
          onClick={() => {
            setFromDate("");
            setToDate("");
            setSourceFilter("");
            setPage(1);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCw className="size-4" /> {t("mealHistory.reset")}
        </button>
        <span className="text-xs text-muted-foreground ms-auto">
          {totalCount} {t("mealHistory.mealsTotal")}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && meals.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("mealHistory.loading")}
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && meals.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="mb-5 rounded-full bg-muted p-5">
            <UtensilsCrossed className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {t("mealHistory.noMealsTitle")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {t("mealHistory.noMealsDesc")}
          </p>
          <Link
            to="/meals/log"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> {t("mealHistory.logFirstMeal")}
          </Link>
        </div>
      )}

      {/* Date-grouped meal list */}
      <div className="space-y-6">
        {grouped.map(([date, dateMeals]) => (
          <section key={date}>
            <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {formatGroupHeader(date)}
            </h2>
            <div className="space-y-3">
              {dateMeals.map((meal) => {
                const SlotIcon =
                  SLOT_ICON[meal.slotName?.toLowerCase()] ?? UtensilsCrossed;
                const src = SOURCE_STYLE[meal.logSource] ?? {
                  icon: UtensilsCrossed,
                  label: meal.logSource,
                  cls: "bg-muted text-muted-foreground",
                };
                return (
                  <div
                    key={meal.id}
                    className="rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-accent/20 text-accent-foreground">
                            <SlotIcon className="size-3" /> {meal.slotName}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {meal.mealTime}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${src.cls}`}
                          >
                            <src.icon className="size-3" /> {src.label}
                          </span>
                        </div>
                        <span className="text-base font-semibold tracking-tight text-foreground whitespace-nowrap">
                          {meal.totalCalories} kcal
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>
                          <span className="font-medium text-foreground">
                            {meal.totalProtein} g
                          </span>{" "}
                          {t("mealHistory.protein")}
                        </span>
                        <span>
                          <span className="font-medium text-foreground">
                            {meal.totalCarbohydrates} g
                          </span>{" "}
                          {t("mealHistory.carbs")}
                        </span>
                        <span>
                          <span className="font-medium text-foreground">
                            {meal.totalFat} g
                          </span>{" "}
                          {t("mealHistory.fat")}
                        </span>
                        <span>
                          <span className="font-medium text-foreground">
                            {meal.totalSugar} g
                          </span>{" "}
                          {t("mealHistory.sugar")}
                        </span>
                        <span>
                          <span className="font-medium text-foreground">
                            {meal.totalFiber} g
                          </span>{" "}
                          {t("mealHistory.fiber")}
                        </span>
                      </div>
                      {meal.noteText && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                          <StickyNote className="size-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{meal.noteText}</span>
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 border-t border-border px-3 py-2">
                      <Link
                        to={`/meals/${meal.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Eye className="size-3.5" /> {t("mealHistory.view")}
                      </Link>
                      <Link
                        to={`/meals/${meal.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Pencil className="size-3.5" /> {t("mealHistory.edit")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(meal.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label={t("mealHistory.deleteAria")}
                      >
                        <Trash2 className="size-3.5" /> {t("mealHistory.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Pagination */}
      <nav
        className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-4"
        aria-label={t("mealHistory.pagination")}
      >
        <span className="text-sm text-muted-foreground">
          {t("mealHistory.pageOf", { page, totalPages })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center justify-center size-9 rounded-lg border border-border bg-muted/50 text-muted-foreground disabled:opacity-50 hover:bg-muted transition-colors"
            aria-label={t("mealHistory.previousPage")}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center justify-center size-9 rounded-lg border border-border bg-muted/50 text-muted-foreground disabled:opacity-50 hover:bg-muted transition-colors"
            aria-label={t("mealHistory.nextPage")}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </nav>
    </section>
  );
}

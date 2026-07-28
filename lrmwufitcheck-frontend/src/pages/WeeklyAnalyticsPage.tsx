import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useGetWeeklyAnalytics } from "@/hooks/api/use-mealtracker";
import type { MealtrackerNutritionDay } from "@/types/api";

function formatDay(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { weekday: "short" });
  } catch {
    return iso;
  }
}

export default function WeeklyAnalyticsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetWeeklyAnalytics();
  const days = data?.nutritionDays ?? [];

  const maxCalories = Math.max(1, ...days.map((d) => d.consumedCalories || 0));
  const targetCalories =
    days.find((d) => d.targetCalories)?.targetCalories || 2000;

  const averages = days.reduce(
    (acc, d) => {
      acc.cal += d.consumedCalories;
      acc.pro += d.consumedProtein;
      acc.car += d.consumedCarbohydrates;
      acc.fat += d.consumedFat;
      acc.sug += d.consumedSugar;
      acc.fib += d.consumedFiber;
      acc.tPro += d.targetProtein;
      acc.tCar += d.targetCarbohydrates;
      acc.tFat += d.targetFat;
      acc.tSug += d.targetSugar;
      acc.tFib += d.targetFiber;
      return acc;
    },
    {
      cal: 0,
      pro: 0,
      car: 0,
      fat: 0,
      sug: 0,
      fib: 0,
      tPro: 0,
      tCar: 0,
      tFat: 0,
      tSug: 0,
      tFib: 0,
    },
  );
  const n = Math.max(1, days.length);

  const macroBars = [
    {
      name: t("weeklyAnalytics.protein"),
      avg: averages.pro / n,
      target: averages.tPro / n,
      color: "bg-chart-1",
    },
    {
      name: t("weeklyAnalytics.carbs"),
      avg: averages.car / n,
      target: averages.tCar / n,
      color: "bg-chart-2",
    },
    {
      name: t("weeklyAnalytics.fat"),
      avg: averages.fat / n,
      target: averages.tFat / n,
      color: "bg-chart-3",
    },
    {
      name: t("weeklyAnalytics.sugar"),
      avg: averages.sug / n,
      target: averages.tSug / n,
      color: "bg-destructive",
    },
    {
      name: t("weeklyAnalytics.fiber"),
      avg: averages.fib / n,
      target: averages.tFib / n,
      color: "bg-chart-4",
    },
  ];

  const onTrack = days.filter(
    (d) => d.targetCalories > 0 && d.consumedCalories <= d.targetCalories,
  ).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10 space-y-6">
      <header className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t("weeklyAnalytics.dashboard")}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("weeklyAnalytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("weeklyAnalytics.subtitle")}
          </p>
        </div>
        <Link
          to="/analytics/monthly"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {t("weeklyAnalytics.monthlyView")}
        </Link>
      </header>

      {isLoading && days.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("weeklyAnalytics.loading")}
        </Card>
      )}

      {!isLoading && days.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("weeklyAnalytics.noData")}
        </Card>
      )}

      {days.length > 0 && (
        <>
          {/* Calorie trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {t("weeklyAnalytics.calories")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t("weeklyAnalytics.target")}: {targetCalories} kcal ·{" "}
                {onTrack}/{days.length} {t("weeklyAnalytics.onTrack")}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2 h-44">
              {days.map((d: MealtrackerNutritionDay) => {
                const h = Math.round((d.consumedCalories / maxCalories) * 100);
                const exceeded =
                  d.targetCalories > 0 && d.consumedCalories > d.targetCalories;
                return (
                  <div
                    key={d.id}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-muted rounded-t-md relative"
                      style={{ height: "100%" }}
                    >
                      <div
                        className={`absolute bottom-0 inset-x-0 rounded-t-md ${
                          exceeded ? "bg-destructive" : "bg-chart-1"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDay(d.summaryDate)}
                    </span>
                    <span className="text-xs font-medium">
                      {d.consumedCalories}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Macro averages */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("weeklyAnalytics.macroAverages")}
            </h2>
            <div className="space-y-3">
              {macroBars.map((m) => {
                const pct =
                  m.target > 0 ? Math.round((m.avg / m.target) * 100) : 0;
                const exceeded = m.target > 0 && m.avg > m.target;
                return (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground">
                        {Math.round(m.avg)} / {Math.round(m.target)} g ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${exceeded ? "bg-destructive" : m.color}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

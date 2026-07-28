import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useGetMonthlyAnalytics } from "@/hooks/api/use-mealtracker";

export default function MonthlyAnalyticsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetMonthlyAnalytics();
  const days = data?.nutritionDays ?? [];

  const n = Math.max(1, days.length);
  const averages = days.reduce(
    (acc, d) => {
      acc.cal += d.consumedCalories;
      acc.pro += d.consumedProtein;
      acc.car += d.consumedCarbohydrates;
      acc.fat += d.consumedFat;
      acc.sug += d.consumedSugar;
      acc.fib += d.consumedFiber;
      return acc;
    },
    { cal: 0, pro: 0, car: 0, fat: 0, sug: 0, fib: 0 },
  );

  const maxCalories = Math.max(1, ...days.map((d) => d.consumedCalories || 0));
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
            <ArrowLeft className="w-4 h-4" /> {t("monthlyAnalytics.dashboard")}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("monthlyAnalytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("monthlyAnalytics.subtitle")}
          </p>
        </div>
        <Link
          to="/analytics/weekly"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {t("monthlyAnalytics.weeklyView")}
        </Link>
      </header>

      {isLoading && days.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("monthlyAnalytics.loading")}
        </Card>
      )}

      {!isLoading && days.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("monthlyAnalytics.noData")}
        </Card>
      )}

      {days.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [t("monthlyAnalytics.daysTracked"), String(days.length)],
              [t("monthlyAnalytics.onTrack"), `${onTrack}/${days.length}`],
              [
                t("monthlyAnalytics.avgCalories"),
                String(Math.round(averages.cal / n)),
              ],
              [
                t("monthlyAnalytics.avgProtein"),
                `${Math.round(averages.pro / n)} g`,
              ],
            ].map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("monthlyAnalytics.dailyCalories")}
            </h2>
            <div className="flex items-end gap-1 h-32">
              {days.map((d) => {
                const h = Math.round((d.consumedCalories / maxCalories) * 100);
                const exceeded =
                  d.targetCalories > 0 && d.consumedCalories > d.targetCalories;
                return (
                  <div
                    key={d.id}
                    className={`flex-1 rounded-t ${
                      exceeded ? "bg-destructive" : "bg-chart-1"
                    }`}
                    style={{ height: `${Math.max(2, h)}%` }}
                    title={`${d.summaryDate}: ${d.consumedCalories} kcal`}
                  />
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("monthlyAnalytics.monthlyAverages")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                [
                  t("monthlyAnalytics.calories"),
                  Math.round(averages.cal / n),
                  "kcal",
                ],
                [
                  t("monthlyAnalytics.protein"),
                  Math.round(averages.pro / n),
                  "g",
                ],
                [t("monthlyAnalytics.carbs"), Math.round(averages.car / n), "g"],
                [t("monthlyAnalytics.fat"), Math.round(averages.fat / n), "g"],
                [t("monthlyAnalytics.sugar"), Math.round(averages.sug / n), "g"],
                [t("monthlyAnalytics.fiber"), Math.round(averages.fib / n), "g"],
              ].map(([label, value, unit]) => (
                <div
                  key={label as string}
                  className="rounded-lg bg-muted/50 p-3"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">
                    {value}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

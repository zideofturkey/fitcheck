import { Link } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useGetMonthlyAnalytics } from "@/hooks/api/use-mealtracker";

export default function MonthlyAnalyticsPage() {
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
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Monthly Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Last 30 days of nutrition tracking.
          </p>
        </div>
        <Link
          to="/analytics/weekly"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Weekly view
        </Link>
      </header>

      {isLoading && days.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          Yükleniyor…
        </Card>
      )}

      {!isLoading && days.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No data available for the past month.
        </Card>
      )}

      {days.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Days tracked", String(days.length)],
              ["On track", `${onTrack}/${days.length}`],
              ["Avg calories", String(Math.round(averages.cal / n))],
              ["Avg protein", `${Math.round(averages.pro / n)} g`],
            ].map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Calories</h2>
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
            <h2 className="text-lg font-semibold mb-4">Monthly Averages</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ["Calories", Math.round(averages.cal / n), "kcal"],
                ["Protein", Math.round(averages.pro / n), "g"],
                ["Carbs", Math.round(averages.car / n), "g"],
                ["Fat", Math.round(averages.fat / n), "g"],
                ["Sugar", Math.round(averages.sug / n), "g"],
                ["Fiber", Math.round(averages.fib / n), "g"],
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

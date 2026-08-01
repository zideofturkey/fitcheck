import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useGetWeeklyAnalytics } from "@/hooks/api/use-mealtracker";
import type { WeeklyAnalyticsResponse } from "@/types/period-analytics";
import PeriodNavigator from "@/components/analytics/PeriodNavigator";
import AnalyticsBadgeRow from "@/components/analytics/AnalyticsBadgeRow";
import SlotBreakdownChart from "@/components/analytics/SlotBreakdownChart";
import EmptyPeriodState from "@/components/analytics/EmptyPeriodState";
import TrendDeltaPill from "@/components/analytics/TrendDeltaPill";

function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysIso(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDay(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { weekday: "short" });
  } catch {
    return iso;
  }
}

function formatPeriodLabel(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  try {
    const s = new Date(start + "T00:00:00.000Z").toLocaleDateString(
      "tr-TR",
      opts,
    );
    const e = new Date(end + "T00:00:00.000Z").toLocaleDateString(
      "tr-TR",
      opts,
    );
    return `${s} - ${e}`;
  } catch {
    return `${start} - ${end}`;
  }
}

export default function WeeklyAnalyticsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = isoToday();
  const referenceDate = searchParams.get("ref") || today;

  const { data, isLoading } = useGetWeeklyAnalytics({ referenceDate });
  const w = (data as WeeklyAnalyticsResponse | undefined)?.weeklyAnalytics;

  const goToDay = (dateIso: string) => {
    const day = dateIso.slice(0, 10);
    navigate(`/meals?from=${day}&to=${day}`);
  };

  const setReferenceDate = (iso: string) => {
    const next = new URLSearchParams(searchParams);
    if (iso === today) {
      next.delete("ref");
    } else {
      next.set("ref", iso);
    }
    setSearchParams(next);
  };

  const chartData = useMemo(
    () =>
      (w?.caloriesTrend ?? []).map((d) => ({
        ...d,
        day: formatDay(d.date),
        exceeded: (d.target ?? 0) > 0 && d.consumed > (d.target ?? 0),
      })),
    [w?.caloriesTrend],
  );

  const avgTarget =
    chartData.length > 0
      ? chartData.reduce((s, d) => s + (d.target ?? 0), 0) / chartData.length
      : 0;

  const macroBars = w
    ? [
        {
          name: t("weeklyAnalytics.protein"),
          avg: w.avgDailyProtein,
          hitRate: w.proteinHitRate,
          deltaPct: w.deltaPct.proteinDeltaPct,
          color: "bg-chart-1",
          higherIsWorse: false,
        },
        {
          name: t("weeklyAnalytics.carbs"),
          avg: w.avgDailyCarbohydrates,
          hitRate: w.carbohydratesHitRate,
          deltaPct: w.deltaPct.carbohydratesDeltaPct,
          color: "bg-chart-2",
          higherIsWorse: false,
        },
        {
          name: t("weeklyAnalytics.fat"),
          avg: w.avgDailyFat,
          hitRate: w.fatHitRate,
          deltaPct: w.deltaPct.fatDeltaPct,
          color: "bg-chart-3",
          higherIsWorse: false,
        },
        {
          name: t("weeklyAnalytics.sugar"),
          avg: w.avgDailySugar,
          hitRate: w.sugarHitRate,
          deltaPct: w.deltaPct.sugarDeltaPct,
          color: "bg-destructive",
          higherIsWorse: true,
        },
        {
          name: t("weeklyAnalytics.fiber"),
          avg: w.avgDailyFiber,
          hitRate: w.fiberHitRate,
          deltaPct: w.deltaPct.fiberDeltaPct,
          color: "bg-chart-4",
          higherIsWorse: false,
        },
      ]
    : [];

  const slotLabels = {
    breakfast: t("weeklyAnalytics.breakfast"),
    lunch: t("weeklyAnalytics.lunch"),
    dinner: t("weeklyAnalytics.dinner"),
    snack: t("weeklyAnalytics.snack"),
    other: t("weeklyAnalytics.other"),
  };

  const showEmptyState = !isLoading && w && w.dayCount < 3;

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

      {w && (
        <PeriodNavigator
          label={formatPeriodLabel(w.periodStart, w.periodEnd)}
          onPrev={() => setReferenceDate(addDaysIso(referenceDate, -7))}
          onNext={() => setReferenceDate(addDaysIso(referenceDate, 7))}
          nextDisabled={referenceDate >= today}
        />
      )}

      {isLoading && !data && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("weeklyAnalytics.loading")}
        </Card>
      )}

      {!isLoading && !w?.dayCount && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("weeklyAnalytics.noData")}
        </Card>
      )}

      {showEmptyState && (
        <EmptyPeriodState
          title={t("weeklyAnalytics.emptyTitle")}
          body={t("weeklyAnalytics.emptyBody")}
          cta={t("weeklyAnalytics.emptyCta")}
        />
      )}

      {w && w.dayCount > 0 && (
        <>
          <AnalyticsBadgeRow
            bestDay={w.bestDay}
            worstDay={w.worstDay}
            streak={w.streak}
            bestLabel={t("weeklyAnalytics.bestDay")}
            worstLabel={t("weeklyAnalytics.worstDay")}
            streakLabel={t("weeklyAnalytics.streak")}
            streakZeroLabel={t("weeklyAnalytics.streakZero")}
            onDayClick={goToDay}
          />

          {/* Calorie trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">
                {t("weeklyAnalytics.calories")}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {t("weeklyAnalytics.target")}: {Math.round(avgTarget)} kcal
                <TrendDeltaPill
                  deltaPct={w.deltaPct.caloriesDeltaPct}
                  noBaselineLabel={t("weeklyAnalytics.noBaseline")}
                />
              </div>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              {t("weeklyAnalytics.clickHint")}
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  onClick={(e) => {
                    const point = e?.activePayload?.[0]?.payload;
                    if (point?.date) goToDay(point.date);
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  {avgTarget > 0 && (
                    <ReferenceLine
                      y={avgTarget}
                      stroke="var(--color-muted-foreground)"
                      strokeDasharray="4 4"
                    />
                  )}
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${value} kcal`, ""]}
                  />
                  <Bar
                    dataKey="consumed"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    isAnimationActive={false}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.date}
                        fill={
                          entry.exceeded
                            ? "var(--color-destructive)"
                            : "var(--color-chart-1)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Macro averages */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("weeklyAnalytics.macroAverages")}
            </h2>
            <div className="space-y-3">
              {macroBars.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{m.name}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {Math.round(m.avg)} g
                      <TrendDeltaPill
                        deltaPct={m.deltaPct}
                        higherIsWorse={m.higherIsWorse}
                        noBaselineLabel={t("weeklyAnalytics.noBaseline")}
                      />
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color}`}
                      style={{ width: `${Math.round(m.hitRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Slot breakdown */}
          {w.slotBreakdown.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("weeklyAnalytics.slotBreakdown")}
              </h2>
              <SlotBreakdownChart data={w.slotBreakdown} labels={slotLabels} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

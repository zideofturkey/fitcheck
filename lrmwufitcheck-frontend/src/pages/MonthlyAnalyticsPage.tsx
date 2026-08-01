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
import { useGetMonthlyAnalytics } from "@/hooks/api/use-mealtracker";
import type { MonthlyAnalyticsResponse } from "@/types/period-analytics";
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

function formatShortDay(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "numeric",
    });
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

export default function MonthlyAnalyticsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = isoToday();
  const referenceDate = searchParams.get("ref") || today;

  const { data, isLoading } = useGetMonthlyAnalytics({ referenceDate });
  const m = (data as MonthlyAnalyticsResponse | undefined)?.monthlyAnalytics;

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
      (m?.caloriesTrend ?? []).map((d) => ({
        ...d,
        day: formatShortDay(d.date),
        exceeded: (d.target ?? 0) > 0 && d.consumed > (d.target ?? 0),
      })),
    [m?.caloriesTrend],
  );

  const avgTarget =
    chartData.length > 0
      ? chartData.reduce((s, d) => s + (d.target ?? 0), 0) / chartData.length
      : 0;

  const onTrack = m
    ? Math.round((m.caloriesHitRate / 100) * m.dayCount)
    : 0;

  const statTiles = m
    ? [
        [t("monthlyAnalytics.daysTracked"), String(m.dayCount)],
        [t("monthlyAnalytics.onTrack"), `${onTrack}/${m.dayCount}`],
        [t("monthlyAnalytics.avgCalories"), String(Math.round(m.avgDailyCalories))],
        [t("monthlyAnalytics.avgProtein"), `${Math.round(m.avgDailyProtein)} g`],
      ]
    : [];

  const macroRows = m
    ? [
        {
          label: t("monthlyAnalytics.calories"),
          value: Math.round(m.avgDailyCalories),
          unit: "kcal",
          deltaPct: m.deltaPct.caloriesDeltaPct,
          higherIsWorse: true,
        },
        {
          label: t("monthlyAnalytics.protein"),
          value: Math.round(m.avgDailyProtein),
          unit: "g",
          deltaPct: m.deltaPct.proteinDeltaPct,
          higherIsWorse: false,
        },
        {
          label: t("monthlyAnalytics.carbs"),
          value: Math.round(m.avgDailyCarbohydrates),
          unit: "g",
          deltaPct: m.deltaPct.carbohydratesDeltaPct,
          higherIsWorse: false,
        },
        {
          label: t("monthlyAnalytics.fat"),
          value: Math.round(m.avgDailyFat),
          unit: "g",
          deltaPct: m.deltaPct.fatDeltaPct,
          higherIsWorse: false,
        },
        {
          label: t("monthlyAnalytics.sugar"),
          value: Math.round(m.avgDailySugar),
          unit: "g",
          deltaPct: m.deltaPct.sugarDeltaPct,
          higherIsWorse: true,
        },
        {
          label: t("monthlyAnalytics.fiber"),
          value: Math.round(m.avgDailyFiber),
          unit: "g",
          deltaPct: m.deltaPct.fiberDeltaPct,
          higherIsWorse: false,
        },
      ]
    : [];

  const slotLabels = {
    breakfast: t("monthlyAnalytics.breakfast"),
    lunch: t("monthlyAnalytics.lunch"),
    dinner: t("monthlyAnalytics.dinner"),
    snack: t("monthlyAnalytics.snack"),
    other: t("monthlyAnalytics.other"),
  };

  const showEmptyState = !isLoading && m && m.dayCount < 3;

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

      {m && (
        <PeriodNavigator
          label={formatPeriodLabel(m.periodStart, m.periodEnd)}
          onPrev={() => setReferenceDate(addDaysIso(referenceDate, -30))}
          onNext={() => setReferenceDate(addDaysIso(referenceDate, 30))}
          nextDisabled={referenceDate >= today}
        />
      )}

      {isLoading && !data && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("monthlyAnalytics.loading")}
        </Card>
      )}

      {!isLoading && !m?.dayCount && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("monthlyAnalytics.noData")}
        </Card>
      )}

      {showEmptyState && (
        <EmptyPeriodState
          title={t("monthlyAnalytics.emptyTitle")}
          body={t("monthlyAnalytics.emptyBody")}
          cta={t("monthlyAnalytics.emptyCta")}
        />
      )}

      {m && m.dayCount > 0 && (
        <>
          <AnalyticsBadgeRow
            bestDay={m.bestDay}
            worstDay={m.worstDay}
            streak={m.streak}
            bestLabel={t("monthlyAnalytics.bestDay")}
            worstLabel={t("monthlyAnalytics.worstDay")}
            streakLabel={t("monthlyAnalytics.streak")}
            streakZeroLabel={t("monthlyAnalytics.streakZero")}
            onDayClick={goToDay}
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statTiles.map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">
                {t("monthlyAnalytics.dailyCalories")}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {t("monthlyAnalytics.target")}: {Math.round(avgTarget)} kcal
                <TrendDeltaPill
                  deltaPct={m.deltaPct.caloriesDeltaPct}
                  noBaselineLabel={t("monthlyAnalytics.noBaseline")}
                />
              </div>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              {t("monthlyAnalytics.clickHint")}
            </p>
            <div className="h-40">
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
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
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
                    radius={[3, 3, 0, 0]}
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

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("monthlyAnalytics.monthlyAverages")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {macroRows.map((row) => (
                <div key={row.label} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="text-lg font-semibold">
                    {row.value}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {row.unit}
                    </span>
                  </p>
                  <TrendDeltaPill
                    deltaPct={row.deltaPct}
                    higherIsWorse={row.higherIsWorse}
                    noBaselineLabel={t("monthlyAnalytics.noBaseline")}
                  />
                </div>
              ))}
            </div>
          </Card>

          {m.slotBreakdown.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("monthlyAnalytics.slotBreakdown")}
              </h2>
              <SlotBreakdownChart data={m.slotBreakdown} labels={slotLabels} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

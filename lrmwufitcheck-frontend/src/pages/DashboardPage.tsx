import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/hooks/api/use-auth";
import {
  useGetDailyProgress,
  useListMealLogs,
} from "@/hooks/api/use-mealtracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowRight,
  Calendar,
  Flame,
  Loader,
  Plus,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import type { MealtrackerMealLog } from "@/types/api";
import MealLogTitle from "@/components/MealLogTitle";

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

const CALORIE_PARTICLE_COUNT = 10;
const CALORIE_PARTICLES = Array.from(
  { length: CALORIE_PARTICLE_COUNT },
  (_, i) => {
    const angle = (i / CALORIE_PARTICLE_COUNT) * Math.PI * 2;
    return {
      top: `${50 + Math.sin(angle) * 44}%`,
      left: `${50 + Math.cos(angle) * 44}%`,
      dx: Math.cos(angle) * 26,
      dy: Math.sin(angle) * 26,
    };
  },
);

function formatMealDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: userData } = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const today = toIsoDate(selectedDate);
  const now = new Date();
  const isToday = isSameDay(selectedDate, now);
  const isYesterday = isSameDay(selectedDate, addDays(now, -1));
  const isDayBeforeYesterday = isSameDay(selectedDate, addDays(now, -2));
  const isTomorrow = isSameDay(selectedDate, addDays(now, 1));
  const relativeDateLabel = isToday
    ? t("dashboard.today")
    : isYesterday
      ? t("dashboard.yesterday")
      : isDayBeforeYesterday
        ? t("dashboard.dayBeforeYesterday")
        : isTomorrow
          ? t("dashboard.tomorrow")
          : formatMealDate(today);
  const { data: progressData, isLoading: progressLoading } =
    useGetDailyProgress({ targetDate: today });
  const { data: mealsData, isLoading: mealsLoading } = useListMealLogs({
    mealDate: today,
  });
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const SOURCE_LABEL: Record<string, string> = {
    foodLibrary: t("dashboard.sourceLibrary"),
    presetTemplate: t("dashboard.sourcePreset"),
    manualEntry: t("dashboard.sourceManual"),
    aiAssistant: t("dashboard.sourceAi"),
    dishTemplate: t("dashboard.sourceDish"),
  };

  const SOURCE_COLOR: Record<string, string> = {
    foodLibrary: "bg-emerald-100 text-emerald-700",
    presetTemplate: "bg-amber-100 text-amber-700",
    manualEntry: "bg-blue-100 text-blue-700",
    aiAssistant: "bg-purple-100 text-purple-700",
    dishTemplate: "bg-pink-100 text-pink-700",
  };

  const toggleMeal = (key: string) =>
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  void toggleMeal;

  const progress = progressData?.nutritionDay;
  const meals = mealsData?.mealLogs ?? [];
  const isLoading = progressLoading || mealsLoading;

  const userName = userData?.fullname ?? "User";

  const calorieConsumed = progress?.consumedCalories ?? 0;
  const calorieTargetDisplay = progress?.targetCalories ?? 0;
  const calorieTarget = progress?.targetCalories || 1;
  const caloriePct = Math.min(
    100,
    Math.round((calorieConsumed / calorieTarget) * 100),
  );
  const calorieRemaining = calorieTargetDisplay - calorieConsumed;
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - caloriePct / 100);

  const macros = [
    {
      key: t("dashboard.protein"),
      consumed: progress?.consumedProtein ?? 0,
      target: progress?.targetProtein ?? 0,
      color: "bg-primary",
      glow: "#059669",
    },
    {
      key: t("dashboard.carbs"),
      consumed: progress?.consumedCarbohydrates ?? 0,
      target: progress?.targetCarbohydrates ?? 0,
      color: "bg-blue-500",
      glow: "#3b82f6",
    },
    {
      key: t("dashboard.fat"),
      consumed: progress?.consumedFat ?? 0,
      target: progress?.targetFat ?? 0,
      color: "bg-amber-500",
      glow: "#f59e0b",
    },
    {
      key: t("dashboard.sugar"),
      consumed: progress?.consumedSugar ?? 0,
      target: progress?.targetSugar ?? 0,
      color: "bg-red-500",
      glow: "#ef4444",
    },
    {
      key: t("dashboard.fiber"),
      consumed: progress?.consumedFiber ?? 0,
      target: progress?.targetFiber ?? 0,
      color: "bg-green-500",
      glow: "#22c55e",
    },
  ];

  const exceededCount = macros.filter(
    (m) => m.target > 0 && m.consumed > m.target,
  ).length;
  const mealCount = progress?.mealCount ?? meals.length;

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.welcome", { name: userName })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                {relativeDateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DatePicker
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    setDatePickerOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <Link to="/meals/log">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              {t("dashboard.newMeal")}
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && !progress ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("dashboard.loading")}
        </div>
      ) : (
        <>
          {/* Daily Summary Ring */}
          <section className="mb-6">
            <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5 sm:p-7 shadow-sm">
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("dashboard.dailyCalorieSummary")}
                  </h4>
                </div>
                {calorieTargetDisplay > 0 && (
                  <Badge
                    variant={calorieRemaining < 0 ? "destructive" : "secondary"}
                    className="text-xs font-medium"
                  >
                    {calorieRemaining < 0
                      ? t("dashboard.overTarget", {
                          amount: Math.abs(calorieRemaining),
                        })
                      : t("dashboard.remainingKcal", {
                          amount: calorieRemaining,
                        })}
                  </Badge>
                )}
              </div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="calorie-ring-group relative w-48 h-48 sm:w-60 sm:h-60">
                  <svg
                    className="w-full h-full -rotate-90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <linearGradient
                        id="calorieRingGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--primary)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="9"
                      className="text-muted/60"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#calorieRingGradient)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-[stroke-dashoffset] duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                      {calorieConsumed}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      / {calorieTargetDisplay} kcal
                    </span>
                    <span className="mt-2 text-xs font-semibold text-primary">
                      %{caloriePct}
                    </span>
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  >
                    {CALORIE_PARTICLES.map((p, i) => (
                      <span
                        key={i}
                        className="particle-dot absolute w-1.5 h-1.5 -ml-0.75 -mt-0.75 rounded-full bg-primary"
                        style={
                          {
                            top: p.top,
                            left: p.left,
                            transitionDelay: `${i * 25}ms`,
                            "--particle-x": `${p.dx}px`,
                            "--particle-y": `${p.dy}px`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex flex-wrap items-center justify-center gap-2">
                {macros.slice(0, 4).map((m) => (
                  <div
                    key={m.key}
                    className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.color}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {m.key}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {m.consumed}g
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Macro Progress */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t("dashboard.macroDetails")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {macros.map((m) => {
                const pct =
                  m.target > 0 ? Math.round((m.consumed / m.target) * 100) : 0;
                const exceeded = m.target > 0 && m.consumed > m.target;
                return (
                  <div
                    key={m.key}
                    className="hover-lift-glow flex flex-col gap-1 rounded-lg border p-3"
                    style={{ "--glow-color": m.glow } as CSSProperties}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{m.key}</span>
                      {exceeded && (
                        <Badge
                          variant="destructive"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {t("dashboard.exceeded")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${m.color}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-0.5 flex items-baseline justify-between">
                      <span className="text-lg font-semibold">
                        {m.consumed}g
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {m.target}g
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      %{pct}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-2xl font-bold text-foreground">
                    {mealCount}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t("dashboard.todaysMeals")}
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className={`p-4 ${exceededCount > 0 ? "border-destructive/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-2xl font-bold text-destructive">
                    {exceededCount}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t("dashboard.exceededTarget")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Meal List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t("dashboard.todaysMealsTitle")}
              </h2>
              <Link
                to="/meals"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                {t("dashboard.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {meals.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                {t("dashboard.noMealsToday")}
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {formatMealDate(today)}
                </h3>
                {meals.map((meal: MealtrackerMealLog) => {
                  return (
                    <Card key={meal.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary"
                          >
                            {meal.slotName}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {meal.mealTime}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            SOURCE_COLOR[meal.logSource] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {SOURCE_LABEL[meal.logSource] ?? meal.logSource}
                        </span>
                      </div>
                      <MealLogTitle
                        mealLogId={meal.id}
                        className="mt-1 text-sm font-medium text-foreground truncate"
                      />
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          {meal.totalCalories} kcal
                        </span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>P:{meal.totalProtein}g</span>
                          <span>K:{meal.totalCarbohydrates}g</span>
                          <span>Y:{meal.totalFat}g</span>
                        </div>
                      </div>
                      {meal.noteText && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {meal.noteText}
                        </p>
                      )}
                      <Link
                        to={`/meals/${meal.id}`}
                        className="mt-2 inline-flex text-xs text-primary hover:underline"
                      >
                        {t("dashboard.viewDetails")}{" "}
                        <ArrowRight className="w-3 h-3 inline" />
                      </Link>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* FAB Mobile */}
          <div className="fixed bottom-24 right-5 md:hidden z-30">
            <Link
              to="/meals/log"
              className="hover-zoom flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              aria-label={t("dashboard.addMealAria")}
              title={t("dashboard.addMealAria")}
            >
              <Plus className="w-6 h-6" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

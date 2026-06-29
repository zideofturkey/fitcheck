import { useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/api/use-auth";
import {
  useGetDailyProgress,
  useListMealLogs,
} from "@/hooks/api/use-mealtracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Circle,
  Loader,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import type { MealtrackerMealLog } from "@/types/api";

const SOURCE_LABEL: Record<MealtrackerMealLog["logSource"], string> = {
  foodLibrary: "Kütüphane",
  presetTemplate: "Preset",
  manualEntry: "Manuel",
  aiAssistant: "AI",
};

const SOURCE_COLOR: Record<MealtrackerMealLog["logSource"], string> = {
  foodLibrary: "bg-emerald-100 text-emerald-700",
  presetTemplate: "bg-amber-100 text-amber-700",
  manualEntry: "bg-blue-100 text-blue-700",
  aiAssistant: "bg-purple-100 text-purple-700",
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const { data: userData } = useCurrentUser();
  const today = todayIso();
  const { data: progressData, isLoading: progressLoading } =
    useGetDailyProgress({ targetDate: today });
  const { data: mealsData, isLoading: mealsLoading } = useListMealLogs({
    mealDate: today,
  });
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const toggleMeal = (key: string) =>
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const progress = progressData?.nutritionDay;
  const meals = mealsData?.mealLogs ?? [];
  const isLoading = progressLoading || mealsLoading;

  const userName = userData?.fullname ?? "User";

  const calorieConsumed = progress?.consumedCalories ?? 0;
  const calorieTarget = progress?.targetCalories || 1;
  const caloriePct = Math.min(
    100,
    Math.round((calorieConsumed / calorieTarget) * 100),
  );
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - caloriePct / 100);

  const macros = [
    {
      key: "Protein",
      consumed: progress?.consumedProtein ?? 0,
      target: progress?.targetProtein ?? 0,
      color: "bg-primary",
    },
    {
      key: "Karbonhidrat",
      consumed: progress?.consumedCarbohydrates ?? 0,
      target: progress?.targetCarbohydrates ?? 0,
      color: "bg-blue-500",
    },
    {
      key: "Yağ",
      consumed: progress?.consumedFat ?? 0,
      target: progress?.targetFat ?? 0,
      color: "bg-amber-500",
    },
    {
      key: "Şeker",
      consumed: progress?.consumedSugar ?? 0,
      target: progress?.targetSugar ?? 0,
      color: "bg-red-500",
    },
    {
      key: "Lif",
      consumed: progress?.consumedFiber ?? 0,
      target: progress?.targetFiber ?? 0,
      color: "bg-green-500",
    },
  ];

  const exceededCount = macros.filter(
    (m) => m.target > 0 && m.consumed > m.target,
  ).length;
  const mealCount = progress?.mealCount ?? meals.length;

  return (
    <div className="relative">
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Ana Sayfa
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Dashboard</span>
          </nav>
          <h1 className="text-2xl font-bold text-foreground">
            Günlük İlerleme
          </h1>
          <p className="text-sm text-muted-foreground">
            Hoş geldin {userName}, bugünkü besin alımın ve hedeflerin
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Bugün
          </Button>
          <Link to="/meals/log">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Yeni Öğün
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && !progress ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          Yükleniyor…
        </div>
      ) : (
        <>
          {/* Daily Summary Ring */}
          <section className="mb-6">
            <Card className="p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Günlük Kalori Özeti
              </h4>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-36 h-36">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      className="text-primary"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground">
                      {calorieConsumed}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {progress?.targetCalories ?? 0} kcal
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {macros.slice(0, 4).map((m) => (
                  <div key={m.key} className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${m.color}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {m.key} {m.consumed}g
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Macro Progress */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Makro Detayları
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {macros.map((m) => {
                const pct =
                  m.target > 0 ? Math.round((m.consumed / m.target) * 100) : 0;
                const exceeded = m.target > 0 && m.consumed > m.target;
                return (
                  <div
                    key={m.key}
                    className="flex flex-col gap-1 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{m.key}</span>
                      {exceeded && (
                        <Badge
                          variant="destructive"
                          className="text-xs px-1.5 py-0.5"
                        >
                          Aşıldı
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
            <Card className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mealCount}
                </p>
                <p className="text-xs text-muted-foreground">Bugünkü öğünler</p>
              </div>
            </Card>
            <Card
              className={`p-5 flex items-center gap-4 ${
                exceededCount > 0 ? "border-destructive/20" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Circle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {exceededCount}
                </p>
                <p className="text-xs text-muted-foreground">Aşılan hedef</p>
              </div>
            </Card>
          </div>

          {/* Meal List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Bugünün Öğünleri
              </h2>
              <Link
                to="/meals"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Tümünü gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {meals.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Henüz bugün için öğün kaydedilmedi.
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {formatMealDate(today)}
                </h3>
                {meals.map((meal) => {
                  const mealKey = meal.id;
                  const isExpanded = expandedMeals.has(mealKey);
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
                            SOURCE_COLOR[meal.logSource]
                          }`}
                        >
                          {SOURCE_LABEL[meal.logSource]}
                        </span>
                      </div>
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
                        Detayları göster{" "}
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
              className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="Yeni öğün ekle"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

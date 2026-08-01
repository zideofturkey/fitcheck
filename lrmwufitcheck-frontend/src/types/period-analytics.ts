import type { MealtrackerNutritionDayListResponse } from "@/types/api";

export interface DayTrendPoint {
  date: string;
  consumed: number;
  target?: number;
}

export interface BestWorstDay {
  date: string;
  consumedCalories: number;
  targetCalories: number;
  diffPct: number;
}

export interface SlotBreakdownEntry {
  slotName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  mealCount: number;
  percentage: number;
}

export interface MacroAverages {
  avgDailyCalories: number;
  avgDailyProtein: number;
  avgDailyCarbohydrates: number;
  avgDailyFat: number;
  avgDailySugar: number;
  avgDailyFiber: number;
}

export interface MacroDeltaPct {
  caloriesDeltaPct: number | null;
  proteinDeltaPct: number | null;
  carbohydratesDeltaPct: number | null;
  fatDeltaPct: number | null;
  sugarDeltaPct: number | null;
  fiberDeltaPct: number | null;
}

export interface PeriodAnalytics extends MacroAverages {
  caloriesHitRate: number;
  proteinHitRate: number;
  carbohydratesHitRate: number;
  fatHitRate: number;
  sugarHitRate: number;
  fiberHitRate: number;
  caloriesTrend: DayTrendPoint[];
  proteinTrend: DayTrendPoint[];
  carbohydratesTrend: DayTrendPoint[];
  fatTrend: DayTrendPoint[];
  sugarTrend: DayTrendPoint[];
  fiberTrend: DayTrendPoint[];
  dayCount: number;
  referenceDate: string;
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;
  previous: MacroAverages;
  deltaPct: MacroDeltaPct;
  bestDay: BestWorstDay | null;
  worstDay: BestWorstDay | null;
  slotBreakdown: SlotBreakdownEntry[];
  streak: number;
}

export type WeeklyAnalyticsResponse = MealtrackerNutritionDayListResponse & {
  weeklyAnalytics: PeriodAnalytics;
};

export type MonthlyAnalyticsResponse = MealtrackerNutritionDayListResponse & {
  monthlyAnalytics: PeriodAnalytics;
};

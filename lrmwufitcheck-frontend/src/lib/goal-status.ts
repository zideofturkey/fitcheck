/**
 * Single source of truth for consumed-vs-target macro goal comparisons.
 * Calories/carbs/fat/sugar are "ceiling" goals (going over is bad); protein/fiber
 * are "floor" goals (going over is fine/good, only falling short matters).
 */
export type GoalDirection = "ceiling" | "floor";

export const MACRO_DIRECTION: Record<
  "calories" | "protein" | "carbs" | "fat" | "sugar" | "fiber",
  GoalDirection
> = {
  calories: "ceiling",
  carbs: "ceiling",
  fat: "ceiling",
  sugar: "ceiling",
  protein: "floor",
  fiber: "floor",
};

export interface GoalStatus {
  /** Whether a real (>0) target is set. */
  hasGoal: boolean;
  /** consumed/target*100, rounded. Null when no goal is set (avoids meaningless %/0 divisions). */
  percentage: number | null;
  /** Ceiling goal was passed - bad, should warn. Always false for floor goals. */
  exceeded: boolean;
  /** Floor goal was reached/passed - good. Always false for ceiling goals or when no goal is set. */
  goalMet: boolean;
}

export function computeGoalStatus(
  consumed: number,
  target: number,
  direction: GoalDirection,
): GoalStatus {
  const hasGoal = target > 0;
  const percentage = hasGoal ? Math.round((consumed / target) * 100) : null;

  if (direction === "ceiling") {
    // Even with no target set (target <= 0), any positive consumption already
    // exceeds a ceiling of 0 - it should still be flagged, just without a %.
    const exceeded = consumed > target;
    return { hasGoal, percentage, exceeded, goalMet: false };
  }

  // Floor goal: exceeding is never "bad", so `exceeded` stays false. Without
  // a target there is nothing to fall short of, so treat it as met.
  const goalMet = hasGoal ? consumed >= target : true;
  return { hasGoal, percentage, exceeded: false, goalMet };
}

export interface GoalEntry {
  consumed: number;
  target: number;
  direction: GoalDirection;
}

/** Counts entries whose ceiling goal was exceeded - never counts floor goals. */
export function countExceededGoals(entries: GoalEntry[]): number {
  return entries.filter(
    (e) => computeGoalStatus(e.consumed, e.target, e.direction).exceeded,
  ).length;
}

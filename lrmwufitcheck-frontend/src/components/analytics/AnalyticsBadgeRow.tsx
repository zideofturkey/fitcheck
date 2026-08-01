import { Flame, ThumbsDown, ThumbsUp } from "lucide-react";
import type { BestWorstDay } from "@/types/period-analytics";

interface AnalyticsBadgeRowProps {
  bestDay: BestWorstDay | null;
  worstDay: BestWorstDay | null;
  streak: number;
  bestLabel: string;
  worstLabel: string;
  streakLabel: string;
  streakZeroLabel: string;
  onDayClick: (dateIso: string) => void;
}

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default function AnalyticsBadgeRow({
  bestDay,
  worstDay,
  streak,
  bestLabel,
  worstLabel,
  streakLabel,
  streakZeroLabel,
  onDayClick,
}: AnalyticsBadgeRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {bestDay && (
        <button
          type="button"
          onClick={() => onDayClick(bestDay.date)}
          className="flex items-center gap-1.5 rounded-full border border-chart-1/30 bg-chart-1/10 px-3 py-1.5 text-xs font-medium text-chart-1 hover:bg-chart-1/20 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {bestLabel}: {formatShortDate(bestDay.date)}
        </button>
      )}
      {worstDay && (
        <button
          type="button"
          onClick={() => onDayClick(worstDay.date)}
          className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          {worstLabel}: {formatShortDate(worstDay.date)}
        </button>
      )}
      <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Flame className="w-3.5 h-3.5" />
        {streak > 0 ? `${streak} ${streakLabel}` : streakZeroLabel}
      </span>
    </div>
  );
}

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface TrendDeltaPillProps {
  deltaPct: number | null;
  /** When true, a positive delta (more consumed) is shown as a bad/red trend (e.g. calories, sugar). */
  higherIsWorse?: boolean;
  noBaselineLabel: string;
}

export default function TrendDeltaPill({
  deltaPct,
  higherIsWorse = true,
  noBaselineLabel,
}: TrendDeltaPillProps) {
  if (deltaPct === null) {
    return (
      <span className="text-xs text-muted-foreground">{noBaselineLabel}</span>
    );
  }

  const rounded = Math.round(deltaPct * 10) / 10;
  const isFlat = Math.abs(rounded) < 0.5;
  const isUp = rounded > 0;
  const isGood = isFlat ? true : higherIsWorse ? !isUp : isUp;

  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const colorClass = isFlat
    ? "text-muted-foreground"
    : isGood
      ? "text-chart-1"
      : "text-destructive";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {isFlat ? "±0%" : `${isUp ? "+" : ""}${rounded}%`}
    </span>
  );
}

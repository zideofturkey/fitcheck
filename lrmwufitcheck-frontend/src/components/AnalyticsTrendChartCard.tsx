import * as React from "react";

interface ChartBar {
  label?: string;
  value: number;
  colorClass?: string;
  heightPercent: number;
}

interface AnalyticsTrendChartCardProps {
  chartTitle: string;
  weeklyLabel: string;
  weeklyActive: boolean;
  monthlyLabel: string;
  monthlyActive: boolean;
  onPeriodChange?: (period: "weekly" | "monthly") => void;
  chartBars: ChartBar[];
  avgLabel: string;
  avgValue: string | number;
  hitRateLabel: string;
  hitRateValue: string | number;
}

const AnalyticsTrendChartCard: React.FC<AnalyticsTrendChartCardProps> = ({
  chartTitle,
  weeklyLabel,
  weeklyActive,
  monthlyLabel,
  monthlyActive,
  onPeriodChange,
  chartBars,
  avgLabel,
  avgValue,
  hitRateLabel,
  hitRateValue,
}) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg p-5 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground">{chartTitle}</h4>
        <div className="flex items-center gap-1 p-0.5 bg-muted rounded-md">
          <button
            type="button"
            onClick={() => onPeriodChange?.("weekly")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              weeklyActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {weeklyLabel}
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange?.("monthly")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              monthlyActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {monthlyLabel}
          </button>
        </div>
      </div>
      <div className="h-48 flex items-end gap-1 mb-4">
        {chartBars.map((bar, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end h-full gap-1"
            title={bar.label || `Bar ${index + 1}`}
          >
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${
                bar.colorClass || "bg-primary"
              }`}
              style={{ height: `${bar.heightPercent}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {avgLabel}: <strong className="text-foreground">{avgValue}</strong>
        </span>
        <span>
          {hitRateLabel}:{" "}
          <strong className="text-foreground">{hitRateValue}</strong>
        </span>
      </div>
    </div>
  );
};

export default AnalyticsTrendChartCard;

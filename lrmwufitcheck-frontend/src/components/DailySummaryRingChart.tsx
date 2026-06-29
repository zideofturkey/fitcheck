import React from "react";

interface DailySummaryRingChartProps {
  title: string;
  circumference: number;
  offset: number;
  consumed_kcal: string | number;
  target_kcal: string | number;
  macro_p_label: string;
  macro_c_label: string;
  macro_f_label: string;
  macro_s_label: string;
}

const DailySummaryRingChart: React.FC<DailySummaryRingChartProps> = ({
  title,
  circumference,
  offset,
  consumed_kcal,
  target_kcal,
  macro_p_label,
  macro_c_label,
  macro_f_label,
  macro_s_label,
}) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg p-5 border border-border shadow-sm">
      <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
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
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">
              {consumed_kcal}
            </span>
            <span className="text-xs text-muted-foreground">
              / {target_kcal} kcal
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></span>
          <span className="text-xs text-muted-foreground">{macro_p_label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-secondary-foreground flex-shrink-0"></span>
          <span className="text-xs text-muted-foreground">{macro_c_label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-foreground flex-shrink-0"></span>
          <span className="text-xs text-muted-foreground">{macro_f_label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-muted-foreground flex-shrink-0"></span>
          <span className="text-xs text-muted-foreground">{macro_s_label}</span>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryRingChart;

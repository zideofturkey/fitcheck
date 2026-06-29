import * as React from "react";

export interface MacroEntry {
  label: string;
  consumed: number;
  target: number;
  percentage: number;
  exceeded: boolean;
  colorClass: string;
}

interface MacroProgressPanelProps {
  macros: MacroEntry[];
}

const MacroProgressPanel: React.FC<MacroProgressPanelProps> = ({ macros }) => {
  if (!macros || macros.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {macros.map((macro, index) => (
        <div
          key={`${macro.label}-${index}`}
          className="flex flex-col gap-1 rounded-lg border p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{macro.label}</span>
            {macro.exceeded && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                Aşıldı
              </span>
            )}
          </div>

          <div className="mt-1">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${macro.colorClass}`}
                style={{ width: `${Math.min(macro.percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-0.5 flex items-baseline justify-between">
            <span className="text-lg font-semibold">{macro.consumed}</span>
            <span className="text-xs text-muted-foreground">
              / {macro.target}
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            %{macro.percentage}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MacroProgressPanel;

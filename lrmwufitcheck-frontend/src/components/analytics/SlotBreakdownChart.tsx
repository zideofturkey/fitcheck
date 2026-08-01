import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SlotBreakdownEntry } from "@/types/period-analytics";

interface SlotBreakdownChartProps {
  data: SlotBreakdownEntry[];
  labels: Record<string, string>;
}

const SLOT_COLORS: Record<string, string> = {
  breakfast: "var(--color-chart-4)",
  lunch: "var(--color-chart-1)",
  dinner: "var(--color-chart-2)",
  snack: "var(--color-chart-3)",
};

export default function SlotBreakdownChart({
  data,
  labels,
}: SlotBreakdownChartProps) {
  const chartData = data
    .filter((s) => s.totalCalories > 0)
    .map((s) => ({
      name: labels[s.slotName] ?? s.slotName,
      value: Math.round(s.totalCalories),
      percentage: s.percentage,
      color: SLOT_COLORS[s.slotName] ?? "var(--color-muted-foreground)",
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} kcal`,
                name,
              ]}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1.5 w-full">
        {chartData.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="text-muted-foreground">
              {entry.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

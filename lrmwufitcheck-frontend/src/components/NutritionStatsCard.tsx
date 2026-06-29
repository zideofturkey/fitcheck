import * as React from "react";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";

interface NutritionStatsCardProps {
  icon: string;
  label: string;
  statusBg: string;
  statusText: string;
  statusLabel: string;
  consumed: number;
  target: number;
  unit: string;
  barColor: string;
  percentage: number;
  remainingText: string;
}

export default function NutritionStatsCard({
  icon,
  label,
  statusBg,
  statusText,
  statusLabel,
  consumed,
  target,
  unit,
  barColor,
  percentage,
  remainingText,
}: NutritionStatsCardProps) {
  const IconComponent = (
    Icons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }> | undefined
    >
  )[icon];
  const sanitizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {IconComponent ? (
            <IconComponent className="w-4 h-4 text-primary" />
          ) : (
            <Icons.HelpCircle className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBg} ${statusText}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-foreground">{consumed}</span>
        <span className="text-sm text-muted-foreground">
          / {target} {unit}
        </span>
      </div>
      <div className="space-y-1">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${barColor}`}
            style={{ width: `${sanitizedPercentage}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{remainingText}</span>
      </div>
    </Card>
  );
}

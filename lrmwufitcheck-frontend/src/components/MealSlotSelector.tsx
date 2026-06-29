import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sunrise, Sun, Moon, Apple } from "lucide-react";

interface MealSlotSelectorProps {
  breakfastLabel: string;
  lunchLabel: string;
  dinnerLabel: string;
  snackLabel: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const MealSlotSelector: React.FC<MealSlotSelectorProps> = ({
  breakfastLabel,
  lunchLabel,
  dinnerLabel,
  snackLabel,
  defaultValue = "breakfast",
  value,
  onValueChange,
}) => {
  return (
    <ToggleGroup
      type="single"
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit"
    >
      <ToggleGroupItem
        value="breakfast"
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <Sunrise className="w-4 h-4" />
          {breakfastLabel}
        </span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="lunch"
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <Sun className="w-4 h-4" />
          {lunchLabel}
        </span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dinner"
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <Moon className="w-4 h-4" />
          {dinnerLabel}
        </span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="snack"
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <Apple className="w-4 h-4" />
          {snackLabel}
        </span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default MealSlotSelector;

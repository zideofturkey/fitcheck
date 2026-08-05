import * as React from "react";
import { EllipsisVertical } from "lucide-react";

interface MealLogEntryRowProps {
  time: string;
  mealSlot: string;
  foodItemsSummary: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sourceLabel: string;
  notesSection?: React.ReactNode;
}

const MealLogEntryRow: React.FC<MealLogEntryRowProps> = ({
  time,
  mealSlot,
  foodItemsSummary,
  calories,
  protein,
  carbs,
  fat,
  sourceLabel,
  notesSection,
}) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground">
              {time}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
              {mealSlot}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {foodItemsSummary}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {calories} kcal
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                P: {protein}g
              </span>
              <span className="text-xs text-muted-foreground">C: {carbs}g</span>
              <span className="text-xs text-muted-foreground">F: {fat}g</span>
            </div>
            {notesSection}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
            {sourceLabel}
          </span>
          <button
            type="button"
            className="tap-target-expand p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="More options"
          >
            <EllipsisVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealLogEntryRow;

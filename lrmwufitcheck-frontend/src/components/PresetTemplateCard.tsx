import { Utensils, EllipsisVertical } from "lucide-react";

interface PresetTemplateCardProps {
  templateName: string;
  description: string;
  itemCount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  primaryActionLabel: string;
  onPrimaryAction?: () => void;
  onMoreAction?: () => void;
}

export default function PresetTemplateCard({
  templateName,
  description,
  itemCount,
  calories,
  protein,
  carbs,
  fat,
  primaryActionLabel,
  onPrimaryAction,
  onMoreAction,
}: PresetTemplateCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {templateName}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
          {itemCount} öğe
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
        <span>{calories} kcal</span>
        <span>P: {protein}g</span>
        <span>C: {carbs}g</span>
        <span>F: {fat}g</span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors"
        >
          <Utensils className="w-3.5 h-3.5" />
          {primaryActionLabel}
        </button>
        <button
          type="button"
          onClick={onMoreAction}
          className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <EllipsisVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import * as React from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FoodLibraryItemRowProps {
  foodIcon: keyof typeof Icons;
  foodName: string;
  brand: string;
  caloriesPer100: number;
  sourceBadge: string;
}

const FoodLibraryItemRow: React.FC<FoodLibraryItemRowProps> = ({
  foodIcon,
  foodName,
  brand,
  caloriesPer100,
  sourceBadge,
}) => {
  const Icon = Icons[foodIcon] as React.ElementType;

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 rounded-md transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          {Icon && <Icon className="w-4 h-4 text-secondary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {foodName}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{brand}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {caloriesPer100} kcal/100g
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge
          variant="secondary"
          className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground hover:bg-muted"
        >
          {sourceBadge}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Icons.Pencil className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default FoodLibraryItemRow;

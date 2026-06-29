import * as React from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

interface IllustratedEmptyStateProps {
  icon: keyof typeof Icons;
  title: string;
  description: string;
  actionIcon: keyof typeof Icons;
  actionLabel: string;
  onAction?: () => void;
}

const IllustratedEmptyState: React.FC<IllustratedEmptyStateProps> = ({
  icon,
  title,
  description,
  actionIcon,
  actionLabel,
  onAction,
}) => {
  const IconComponent = Icons[icon] as React.FC<{ className?: string }>;
  const ActionIconComponent = Icons[actionIcon] as React.FC<{
    className?: string;
  }>;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <IconComponent className="w-12 h-12 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      <Button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors"
      >
        <ActionIconComponent className="w-4 h-4" />
        {actionLabel}
      </Button>
    </div>
  );
};

export default IllustratedEmptyState;

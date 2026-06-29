import * as React from "react";
import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardPageHeaderProps {
  breadcrumb_home: string;
  breadcrumb_current: string;
  title: string;
  description: string;
  left_action_icon: string;
  left_action_label: string;
  right_action_icon: string;
  right_action_label: string;
  onLeftAction?: () => void;
  onRightAction?: () => void;
  onHomeClick?: () => void;
}

const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  breadcrumb_home,
  breadcrumb_current,
  title,
  description,
  left_action_icon,
  left_action_label,
  right_action_icon,
  right_action_label,
  onLeftAction,
  onRightAction,
  onHomeClick,
}) => {
  const LeftIcon = (
    Icons as unknown as Record<
      string,
      React.ComponentType<
        { className?: string } | React.SVGProps<SVGSVGElement>
      >
    >
  )[left_action_icon];

  const RightIcon = (
    Icons as unknown as Record<
      string,
      React.ComponentType<
        { className?: string } | React.SVGProps<SVGSVGElement>
      >
    >
  )[right_action_icon];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-1">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <a
            href="#"
            className="hover:text-foreground transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onHomeClick?.();
            }}
          >
            {breadcrumb_home}
          </a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">
            {breadcrumb_current}
          </span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onLeftAction}
          className="gap-2"
        >
          {LeftIcon && <LeftIcon className="w-4 h-4" />}
          {left_action_label}
        </Button>
        <Button size="sm" onClick={onRightAction} className="gap-2">
          {RightIcon && <RightIcon className="w-4 h-4" />}
          {right_action_label}
        </Button>
      </div>
    </div>
  );
};

export default DashboardPageHeader;

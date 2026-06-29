import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

interface AiSourceBadgeProps {
  showTooltip?: boolean;
  tooltipText?: string;
}

const AiSourceBadge: FC<AiSourceBadgeProps> = ({
  showTooltip = true,
  tooltipText = "Created by AI Assistant",
}) => {
  const badgeContent = (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200">
      <Sparkles className="w-3 h-3" />
      AI
    </span>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AiSourceBadge;

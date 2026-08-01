import { ChevronLeft, ChevronRight } from "lucide-react";

interface PeriodNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}

export default function PeriodNavigator({
  label,
  onPrev,
  onNext,
  nextDisabled,
}: PeriodNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="min-w-[11rem] text-center text-sm font-medium text-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

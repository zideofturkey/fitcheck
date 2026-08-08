import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollThumb } from "@/hooks/use-scroll-thumb";
import { ScrollThumbIndicator } from "@/components/ui/scroll-thumb-indicator";

export interface FlatPickerOption {
  value: string;
  label: string;
}

/**
 * Single-select dropdown built from a plain toggle button + absolutely
 * positioned list, not Radix Select. Radix's Select trigger has its own
 * internal open/close handling (geared for combobox/keyboard semantics) that
 * on touch reopens itself a beat after being closed - reproduced directly via
 * data-state inspection, and not fixable from the outside (tried controlling
 * `open` ourselves and closing via a capture-phase handler on the trigger,
 * and via a fully separate overlay button with an explicit, non-toggling
 * setState - Radix's own trigger still won the race both times). This
 * component owns 100% of its open state via one plain boolean, so there's no
 * second authority to race against.
 */
export function FlatPicker({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: FlatPickerOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(
    null,
  );
  // `!!contentEl` (not `open`) as the active flag: the content div and its
  // ref both first appear in the *same* render where open flips true, so
  // contentEl is still null at that instant - the ref callback's state
  // update lands one render later. Keying off `open` directly would attach
  // the tracker's effect against a `getEl` closure that's permanently stuck
  // on that first, still-null contentEl (the effect never re-runs since
  // `open` itself doesn't change again). Keying off `!!contentEl` makes the
  // effect's own dependency flip false->true exactly when the element
  // becomes available, so it (re)attaches against the real node.
  const thumb = useScrollThumb(() => contentEl, !!contentEl);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50",
          triggerClassName,
        )}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 pointer-events-none text-muted-foreground" />
      </button>
      {open && (
        <div
          ref={setContentEl}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 max-h-[min(21rem,60vh)] w-full min-w-36 overflow-x-hidden overflow-y-auto rounded-lg border border-foreground/10 bg-popover p-1 text-popover-foreground shadow-md",
            contentClassName,
          )}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className="relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-1.5 text-left text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
              onClick={() => {
                onValueChange(o.value);
                setOpen(false);
              }}
            >
              <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                {o.value === value && <Check className="size-4" />}
              </span>
              {o.label}
            </button>
          ))}
          <ScrollThumbIndicator thumb={thumb} />
        </div>
      )}
    </div>
  );
}

import type { ScrollThumb } from "@/hooks/use-scroll-thumb";

export function ScrollThumbIndicator({ thumb }: { thumb: ScrollThumb | null }) {
  if (!thumb) return null;
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0.5 w-1 z-10">
      <div
        className="absolute w-full rounded-full bg-foreground/25"
        style={{ top: `${thumb.top}%`, height: `${thumb.height}%` }}
      />
    </div>
  );
}

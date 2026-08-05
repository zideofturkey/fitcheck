import { createPortal } from "react-dom";

/**
 * Shared backdrop for popup-style components (Radix Popover/DropdownMenu
 * content, which don't render their own overlay the way Dialog does).
 * Drop this in next to any <Popover> whose content should read as clearly
 * "on top of" the page instead of blending into it - render it with the
 * same `open` boolean the popover itself uses.
 *
 * `pointer-events: none` (see .popover-backdrop in index.css) so it never
 * fights Radix's own outside-click-to-dismiss handling - it's purely the
 * visual blur/dim layer, not an interaction layer.
 */
export default function PopoverBackdrop({ open }: { open: boolean }) {
  if (!open) return null;
  return createPortal(
    <div className="popover-backdrop" aria-hidden="true" />,
    document.body,
  );
}

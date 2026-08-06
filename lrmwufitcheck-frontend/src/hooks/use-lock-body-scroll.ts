import { useEffect } from "react";

/**
 * Locks body scroll while `locked` is true, using the fixed-position +
 * negative-top-offset technique rather than a plain `overflow: hidden`.
 * Real iOS Safari renders `position: fixed` full-screen drawers relative to
 * the page's scroll position at the moment they mount when the body behind
 * them is still scrollable - if the food/dish library list was scrolled
 * down before opening a drawer, the drawer (and its sticky header) can
 * paint offset from the visual viewport, clipping the first field behind
 * the header. Desktop Chrome's mobile emulation does not reproduce this;
 * it only shows up on a real device. Locking body scroll while a drawer is
 * open removes the scroll-position interaction that triggers it.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prevPosition = style.position;
    const prevTop = style.top;
    const prevWidth = style.width;
    const prevOverflow = style.overflow;

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = prevPosition;
      style.top = prevTop;
      style.width = prevWidth;
      style.overflow = prevOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

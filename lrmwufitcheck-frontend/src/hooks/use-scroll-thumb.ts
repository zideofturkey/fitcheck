import { useEffect, useState } from "react";

export interface ScrollThumb {
  top: number;
  height: number;
}

/**
 * Tracks scroll position of `getEl()` and returns thumb {top, height}
 * percentages for a custom right-edge scroll indicator, or null when the
 * content doesn't overflow. Needed because mobile browsers largely ignore
 * ::-webkit-scrollbar styling on touch devices (native overlay scrollbars
 * only flash briefly during an active touch-scroll, if at all), so a
 * CSS-only scrollbar thumb is invisible there in practice.
 */
export function useScrollThumb(
  getEl: () => HTMLElement | null,
  active: boolean,
): ScrollThumb | null {
  const [thumb, setThumb] = useState<ScrollThumb | null>(null);

  useEffect(() => {
    if (!active) {
      setThumb(null);
      return;
    }
    let el: HTMLElement | null = null;
    let ro: ResizeObserver | null = null;
    let timer = 0;

    const update = () => {
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 1) {
        setThumb(null);
        return;
      }
      const heightPct = Math.max((clientHeight / scrollHeight) * 100, 10);
      const topPct =
        (scrollTop / (scrollHeight - clientHeight)) * (100 - heightPct);
      setThumb({ top: topPct, height: heightPct });
    };

    // The popup content hasn't necessarily finished its own layout/sizing
    // pass (Radix repositions/resizes via its own effects) on the same tick
    // it mounts - a macrotask delay lets that settle, then re-query fresh
    // rather than trust a stale reference, and keep observing for resize.
    const attach = () => {
      el = getEl();
      if (!el) {
        timer = window.setTimeout(attach, 16);
        return;
      }
      update();
      ro = new ResizeObserver(update);
      ro.observe(el);
      el.addEventListener("scroll", update, { passive: true });
    };
    timer = window.setTimeout(attach, 16);

    return () => {
      window.clearTimeout(timer);
      ro?.disconnect();
      el?.removeEventListener("scroll", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return thumb;
}

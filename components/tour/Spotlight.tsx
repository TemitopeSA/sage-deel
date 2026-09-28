"use client";

import * as React from "react";

const PAD = 8;

/** Tracks a target element's viewport rect, scrolling it into view once found. */
export function useTargetRect(selector: string | null, stepKey: string | number) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRect(null);
    if (!selector) return;
    let raf = 0;
    let scrolled = false;
    let last = "";
    const loop = () => {
      const el = document.querySelector(selector);
      if (el) {
        if (!scrolled) {
          scrolled = true;
          const r = el.getBoundingClientRect();
          // Pin near the top when there's room for the tour card underneath; otherwise center it.
          const room = window.innerHeight - 64;
          const offset = r.height + 300 < room ? 92 : r.height < room - 40 ? (room - r.height) / 2 + 64 : 88;
          window.scrollTo({ top: Math.max(0, r.top + window.scrollY - offset), behavior: "smooth" });
        }
        const r = el.getBoundingClientRect();
        const sig = `${Math.round(r.top)}|${Math.round(r.left)}|${Math.round(r.width)}|${Math.round(r.height)}`;
        if (sig !== last) {
          last = sig;
          setRect(r);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [selector, stepKey]);

  return rect;
}

export function SpotlightMask({ rect, dim = 0.55 }: { rect: DOMRect | null; dim?: number }) {
  if (!rect) {
    return <div className="pointer-events-none fixed inset-0 z-[80] transition-colors duration-300" style={{ background: `rgb(18 17 24 / ${dim})` }} aria-hidden />;
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[80] rounded-[18px] ring-2 ring-white/70 transition-all duration-300 ease-out"
      style={{
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        boxShadow: `0 0 0 9999px rgb(18 17 24 / ${dim})`,
      }}
    />
  );
}

/** Position a floating card next to the spotlight without leaving the viewport. */
export function placeCard(rect: DOMRect | null, w: number, h: number) {
  if (typeof window === "undefined" || !rect) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 18;
  let top: number;
  if (vh - rect.bottom > h + gap + 16) top = rect.bottom + gap;
  else if (rect.top > h + gap + 16) top = rect.top - h - gap;
  else top = Math.min(vh - h - 16, Math.max(16, rect.top + 16));
  let left = rect.left;
  const sideways = !(vh - rect.bottom > h + gap + 16) && !(rect.top > h + gap + 16);
  if (sideways) {
    if (rect.right + gap + w < vw) left = rect.right + gap;
    else if (rect.left - w - gap > 16) left = rect.left - w - gap;
    else {
      // No room outside the target: tuck the card into its lower-right corner.
      left = rect.right - w - 20;
      top = Math.min(vh - h - 16, rect.bottom - h - 20);
    }
  }
  left = Math.min(vw - w - 16, Math.max(16, left));
  return { top, left };
}

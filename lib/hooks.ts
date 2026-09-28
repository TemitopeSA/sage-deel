"use client";

import * as React from "react";

/** Animates a number from whatever is currently shown to `target`. */
export function useCountUp(target: number, duration = 900, from?: number) {
  const [value, setValue] = React.useState(from ?? target);
  const shown = React.useRef(from ?? target);

  React.useEffect(() => {
    const start = shown.current;
    if (start === target) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      shown.current = start + (target - start) * eased;
      setValue(shown.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/** Brief skeleton state on first mount, to show loading patterns without a backend. */
export function useSimulatedLoad(ms = 420) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return loading;
}

/** Typewriter reveal for AI responses. */
export function useTypewriter(text: string, enabled: boolean, speed = 14) {
  const [n, setN] = React.useState(enabled ? 0 : text.length);
  React.useEffect(() => {
    if (!enabled) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setN(Math.min(text.length, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, enabled, speed]);
  return text.slice(0, n);
}

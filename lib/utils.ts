import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** $2.84M / $264K / $15,780 */
export function money(n: number, opts: { compact?: boolean; decimals?: number } = {}) {
  const { compact = false, decimals } = opts;
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (compact && abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(decimals ?? 2)}M`;
  if (compact && abs >= 10_000) return `${sign}$${Math.round(abs / 1000)}K`;
  if (compact && abs >= 1_000) return `${sign}$${(abs / 1000).toFixed(decimals ?? 1)}K`;
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

/** +18% / −9% (uses a real minus sign) */
export function pct(n: number, opts: { signed?: boolean; decimals?: number } = {}) {
  const { signed = true, decimals = 0 } = opts;
  const v = (Math.abs(n) * 100).toFixed(decimals);
  if (!signed) return `${v}%`;
  if (Math.abs(n) < 0.0005) return `0%`;
  return `${n > 0 ? "+" : "−"}${v}%`;
}

export const num = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

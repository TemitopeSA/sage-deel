import { track as vercelTrack } from "@vercel/analytics";

/** Custom product events (Vercel Web Analytics). No personal data is sent. */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(event, props);
  } catch {
    /* analytics unavailable (local dev, blockers) */
  }
}

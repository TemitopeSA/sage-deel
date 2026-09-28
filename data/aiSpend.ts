import type { AiTool, TeamId } from "@/types";

// Tool totals reconcile to the sum of team AI spend (and of worker aiSpend): $96,420.
export const aiTools: AiTool[] = [
  { name: "Claude", spend: 31420, seats: 112, color: "#4B3CF0" },
  { name: "GitHub Copilot", spend: 26800, seats: 78, color: "#EB6834" },
  { name: "Cursor", spend: 18200, seats: 61, color: "#1BAF7A" },
  { name: "ChatGPT", spend: 12600, seats: 94, color: "#EDA100" },
  { name: "Other", spend: 7400, seats: 38, color: "#B4B0A8" },
];

export const AI_BUDGET = 110000;
/** Trailing 7-day daily run rate, used for the month-end projection. */
export const AI_DAILY_RUN_RATE = 6240;
export const DAYS_REMAINING = 2;

/**
 * Share of each team's AI spend that is routine (summaries, boilerplate, classification)
 * and could be routed to a lower-cost approved model. Illustrative workload distribution.
 */
export const routableShare: Record<TeamId, number> = {
  platform: 0.14,
  product: 0.15,
  data: 0.11,
  sales: 0.16,
  success: 0.2,
  ga: 0.1,
};

export const unusedSeats = [
  { name: "Callum Hughes", tool: "Cursor", team: "Sales", lastActive: "43 days ago", cost: 40 },
  { name: "Hannah Braun", tool: "GitHub Copilot", team: "G&A", lastActive: "Never", cost: 39 },
];

export const pendingProvisioning = {
  count: 12,
  example: {
    name: "Sarah Chen",
    role: "Senior Product Designer",
    team: "Product Engineering",
    start: "Oct 6, 2026",
    tools: [
      { name: "Claude", cost: 90 },
      { name: "Figma AI", cost: 35 },
      { name: "ChatGPT", cost: 60 },
    ],
  },
};

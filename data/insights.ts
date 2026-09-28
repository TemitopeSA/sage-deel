import {
  byTeam,
  countryRow,
  engineering,
  highSpendLowOutput,
  teamRow,
  topEngineeringAiShare,
  topEngineeringAiUsers,
} from "@/lib/metrics";
import { pct } from "@/lib/utils";

export type InsightAction =
  | { kind: "team-economics"; team?: "engineering" | "success" | "platform" }
  | { kind: "ai-spend"; focus?: "signals" }
  | { kind: "country"; country: "PL" | "NG" }
  | { kind: "worker"; name: string };

export interface Insight {
  id: string;
  icon: "trending" | "globe" | "sparkles" | "gauge";
  tone: "positive" | "neutral" | "warning";
  headline: string;
  detail: string;
  cta: string;
  action: InsightAction;
  sources: string[];
}

const us = countryRow("US").engineering;
const pl = countryRow("PL").engineering;
const cs = teamRow("success");
const platform = teamRow("platform");

export const insights: Insight[] = [
  {
    id: "eng-ai-leverage",
    icon: "trending",
    tone: "positive",
    headline: `Platform AI spend is up ${pct(platform.aiChange)}, while cost per PR is down ${pct(-platform.costPerOutputChange, { signed: false })}.`,
    detail: `Merged PRs grew ${pct(platform.team.trend.output)} over 90 days with ${pct(platform.team.trend.cost)} workforce cost growth. AI appears to be creating leverage here.`,
    cta: "View team",
    action: { kind: "team-economics", team: "platform" },
    sources: ["GitHub", "Deel Payroll"],
  },
  {
    id: "poland-output",
    icon: "globe",
    tone: "neutral",
    headline: `Poland delivers similar engineering output at ${pct(1 - pl.avgCost / us.avgCost, { signed: false })} lower fully loaded cost than the US cohort.`,
    detail: `Output index ${pl.output.toFixed(0)} vs ${us.output.toFixed(0)} across ${pl.headcount} and ${us.headcount} engineers. Worth weighing for the next backfill.`,
    cta: "Compare markets",
    action: { kind: "country", country: "PL" },
    sources: ["Deel EOR", "Jira"],
  },
  {
    id: "ai-concentration",
    icon: "sparkles",
    tone: "warning",
    headline: `${topEngineeringAiUsers.length} people account for ${pct(topEngineeringAiShare, { signed: false })} of engineering AI spend.`,
    detail: `${highSpendLowOutput.length} high-spend, below-benchmark signals need a closer look. Usage may be exploratory, so review contributing factors first.`,
    cta: "Investigate",
    action: { kind: "ai-spend", focus: "signals" },
    sources: ["Deel IT", "Tool billing"],
  },
  {
    id: "cs-benchmark",
    icon: "gauge",
    tone: "warning",
    headline: `Customer Success cost per output runs ${pct(cs.team.vsPeerBenchmark, { signed: false })} above the peer benchmark.`,
    detail: `Ticket volume is up ${pct(cs.team.trend.output)} but renewal coverage is flat. Zendesk isn't connected, so output may be under-counted.`,
    cta: "View team",
    action: { kind: "team-economics", team: "success" },
    sources: ["Salesforce", "Peer benchmark"],
  },
];

export const mainInsight = {
  headline: "Engineering output is growing faster than engineering cost.",
  metrics: [
    { label: "Engineering output", value: engineering.outputChange, good: "up" as const },
    { label: "Workforce cost", value: engineering.costChange, good: "down" as const },
    { label: "AI spend", value: engineering.aiChange, good: "neutral" as const },
    { label: "Cost per output point", value: engineering.costPerOutputChange, good: "down" as const },
  ],
  context: `${engineering.headcount} engineers across ${engineering.countries} countries · last 90 days vs prior 90`,
};

export const teamsAboveBenchmark = byTeam.filter((r) => r.team.vsPeerBenchmark > 0).length;

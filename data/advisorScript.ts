import type { ScenarioId } from "@/lib/store";
import { company, countryRow, engineering } from "@/lib/metrics";
import { hiringOptions, usBenchmark, HIRES } from "./hiringScenarios";
import { money } from "@/lib/utils";

export interface Stage {
  label: string;
  detail: string;
}

const us = countryRow("US").engineering;
const engOutput = engineering.workers.reduce((s, w) => s + w.outputIndex, 0) / engineering.headcount;

// The chain the advisor walks through, made visible so a CFO can audit the reasoning.
const hireStages: Stage[] = [
  { label: "Workforce data", detail: `${company.headcount} workers · 8 countries · Deel HRIS, Payroll, EOR` },
  { label: "Current cost", detail: `US engineering benchmark ${money(usBenchmark.monthly)}/mo fully loaded (n=${us.headcount})` },
  { label: "Current output", detail: `Engineering Output Index avg ${engOutput.toFixed(0)} across ${engineering.headcount} engineers · GitHub, Jira` },
  { label: "Country economics", detail: `${hiringOptions.length} markets where you already employ engineers` },
  { label: "Employment model", detail: "EOR vs contractor per market · classification risk checked" },
  { label: "Hiring scenario", detail: `${HIRES} × Backend Engineer · 12-month fully loaded cost` },
  { label: "Recommendation", detail: "Scored on cost, expected output, compliance, talent depth and speed" },
];

export const stagesFor: Record<ScenarioId, Stage[]> = {
  hire10: hireStages,
  compare: [
    hireStages[0],
    { label: "Current cost", detail: `Poland and Brazil engineering cohorts (n=${countryRow("PL").engineering.headcount}, ${countryRow("BR").engineering.headcount})` },
    hireStages[2],
    { label: "Country economics", detail: "Employer contributions, benefits, time zones" },
    { label: "Employment model", detail: "Poland EOR · Brazil EOR and contractor" },
    { label: "Hiring scenario", detail: `${HIRES} × Backend Engineer · 12 months` },
    { label: "Recommendation", detail: "Trade-offs summarized" },
  ],
  model: [
    hireStages[0],
    { label: "Current cost", detail: "Nigeria engineering cohort, fully loaded" },
    hireStages[2],
    { label: "Country economics", detail: "Nigeria · statutory contributions and benefits" },
    { label: "Employment model", detail: "EOR vs contractor cost structure" },
    { label: "Classification", detail: "Full-time, long-term, integrated roles → higher contractor risk" },
    { label: "Recommendation", detail: "Model fit by role type" },
  ],
  reduce: [
    hireStages[0],
    { label: "Current cost", detail: `${money(company.cost, { compact: true })}/mo across 6 teams` },
    { label: "Current output", detail: "Output Index by team and market" },
    { label: "AI & software", detail: `${money(company.ai)}/mo AI spend · seat utilization` },
    { label: "Attrition & backfills", detail: "Planned backfills from Workforce Planning" },
    { label: "Capacity check", detail: "Only changes that keep headcount and output flat" },
    { label: "Recommendation", detail: "Ranked by savings and effort" },
  ],
};

export const statusFor = (stage: number) =>
  stage < 2
    ? "Analyzing your workforce data…"
    : stage < 3
      ? "Comparing current team economics…"
      : stage < 5
        ? `Modeling ${hiringOptions.length} markets…`
        : "Preparing recommendation…";

export function matchScenario(q: string): ScenarioId {
  const s = q.toLowerCase();
  if (/(poland|brazil).*(poland|brazil)|compare/.test(s)) return "compare";
  if (/contractor|employee|eor|model/.test(s)) return "model";
  if (/reduce|save|saving|cut|cost down|efficien/.test(s)) return "reduce";
  return "hire10";
}

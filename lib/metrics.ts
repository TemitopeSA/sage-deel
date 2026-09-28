import type { CountryCode, TeamId, Worker, WorkerType } from "@/types";
import { workers } from "@/data/workers";
import { countries, countryByCode } from "@/data/countries";
import { teams, teamById } from "@/data/teams";

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
export const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Cost per output point — the single efficiency unit used across Sage. */
export const costPerOutput = (cost: number, output: number) => (output ? cost / output : 0);

export interface WorkerFilters {
  team: TeamId | "all" | "engineering";
  country: CountryCode | "all";
  workerType: WorkerType | "all";
}

export const defaultFilters: WorkerFilters = { team: "all", country: "all", workerType: "all" };

export function filterWorkers(f: WorkerFilters, list: Worker[] = workers) {
  return list.filter(
    (w) =>
      (f.team === "all" ||
        (f.team === "engineering" ? teamById[w.team].isEngineering : w.team === f.team)) &&
      (f.country === "all" || w.country === f.country) &&
      (f.workerType === "all" || w.workerType === f.workerType),
  );
}

export function summarize(list: Worker[]) {
  const cost = sum(list.map((w) => w.fullyLoadedMonthlyCost));
  const output = avg(list.map((w) => w.outputIndex));
  const avgCost = list.length ? cost / list.length : 0;
  return {
    headcount: list.length,
    cost,
    avgCost,
    output,
    ai: sum(list.map((w) => w.aiSpend)),
    costPerOutput: costPerOutput(avgCost, output),
    components: {
      base: sum(list.map((w) => w.baseSalary)),
      taxes: sum(list.map((w) => w.employerTaxes)),
      benefits: sum(list.map((w) => w.benefits)),
      fees: sum(list.map((w) => w.deelFees)),
      equipment: sum(list.map((w) => w.equipmentCost)),
      software: sum(list.map((w) => w.softwareCost)),
      ai: sum(list.map((w) => w.aiSpend)),
    },
  };
}

export const company = summarize(workers);

// Period-over-period context (illustrative history).
export const PREV_MONTH_TOTAL_COST = Math.round(company.cost / (1 - 0.038));
export const PREV_MONTH_AI = Math.round(company.ai / 1.142);

export const byTeam = teams.map((team) => {
  const list = workers.filter((w) => w.team === team.id);
  const s = summarize(list);
  const peerBenchmark = s.costPerOutput / (1 + team.vsPeerBenchmark);
  const costPerOutputChange = (1 + team.trend.cost) / (1 + team.trend.output) - 1;
  return {
    team,
    ...s,
    peerBenchmark,
    costPerOutputChange,
    aiDelta: team.aiSpend - team.trend.aiSpendPrev,
    aiChange: team.aiSpend / team.trend.aiSpendPrev - 1,
  };
});
export type TeamRow = (typeof byTeam)[number];
export const teamRow = (id: TeamId) => byTeam.find((r) => r.team.id === id)!;

export const byCountry = countries.map((country) => {
  const list = workers.filter((w) => w.country === country.code);
  const eng = list.filter((w) => teamById[w.team].isEngineering);
  return {
    country,
    ...summarize(list),
    engineering: summarize(eng),
    types: {
      EOR: list.filter((w) => w.workerType === "EOR").length,
      Contractor: list.filter((w) => w.workerType === "Contractor").length,
      Employee: list.filter((w) => w.workerType === "Employee").length,
    },
    teams: teams.map((t) => ({ team: t, count: list.filter((w) => w.team === t.id).length })),
  };
});
export type CountryRow = (typeof byCountry)[number];
export const countryRow = (c: CountryCode) => byCountry.find((r) => r.country.code === c)!;

export const workerTypeMix = (["EOR", "Contractor", "Employee"] as WorkerType[]).map((t) => ({
  type: t,
  count: workers.filter((w) => w.workerType === t).length,
}));

// Engineering aggregate: output weighted by headcount, cost weighted by spend.
const engRows = byTeam.filter((r) => r.team.isEngineering);
export const engineering = (() => {
  const hc = sum(engRows.map((r) => r.headcount));
  const cost = sum(engRows.map((r) => r.cost));
  const outputChange = sum(engRows.map((r) => r.team.trend.output * r.headcount)) / hc;
  const costChange = sum(engRows.map((r) => r.team.trend.cost * r.cost)) / cost;
  const ai = sum(engRows.map((r) => r.team.aiSpend));
  const aiPrev = sum(engRows.map((r) => r.team.trend.aiSpendPrev));
  const list = workers.filter((w) => teamById[w.team].isEngineering);
  return {
    headcount: hc,
    cost,
    outputChange,
    costChange,
    ai,
    aiChange: ai / aiPrev - 1,
    costPerOutputChange: (1 + costChange) / (1 + outputChange) - 1,
    workers: list,
    countries: new Set(list.map((w) => w.country)).size,
  };
})();

export function engineeringCohort(c: CountryCode) {
  return summarize(workers.filter((w) => w.country === c && teamById[w.team].isEngineering));
}

// ---- AI spend signals --------------------------------------------------

export const AI_ALLOWANCE = { engineering: 2000, other: 900 };

export const allowanceFor = (w: Worker) =>
  teamById[w.team].isEngineering ? AI_ALLOWANCE.engineering : AI_ALLOWANCE.other;

export const overAllowance = workers
  .filter((w) => w.aiSpend > allowanceFor(w))
  .sort((a, b) => b.aiSpend - a.aiSpend);

export const highSpendLowOutput = workers
  .filter((w) => {
    const row = teamRow(w.team);
    const teamMedianAi = median(workers.filter((x) => x.team === w.team).map((x) => x.aiSpend));
    return w.aiSpend > teamMedianAi * 2 && w.outputIndex < row.output - 5;
  })
  .sort((a, b) => b.aiSpend - a.aiSpend);

export const topEngineeringAiUsers = [...engineering.workers]
  .sort((a, b) => b.aiSpend - a.aiSpend)
  .slice(0, 3);
export const topEngineeringAiShare =
  sum(topEngineeringAiUsers.map((w) => w.aiSpend)) / engineering.ai;

// Worker-level benchmark for side panel comparisons.
export function workerBenchmark(w: Worker) {
  const row = teamRow(w.team);
  const own = costPerOutput(w.fullyLoadedMonthlyCost, w.outputIndex);
  return {
    own,
    team: row.costPerOutput,
    delta: own / row.costPerOutput - 1,
    teamAvgCost: row.avgCost,
    teamAvgOutput: row.output,
    teamAvgAi: row.ai / row.headcount,
  };
}

export const countryName = (c: CountryCode) => countryByCode[c].name;

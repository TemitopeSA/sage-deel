import type { CountryCode, HiringOption, WorkerType } from "@/types";
import { workers } from "./workers";
import { countryByCode } from "./countries";
import { teamById } from "./teams";
import { avg } from "@/lib/metrics";

/**
 * Hiring scenarios are modeled from Northwind's *own* engineering cohort in each market,
 * then re-costed under the chosen employment model. Illustrative only — not Deel pricing,
 * compensation benchmarks, or legal/tax advice.
 */

export const HIRES = 10;
export const ROLE = "Backend Engineer";

const eng = workers.filter((w) => teamById[w.team].isEngineering);
const engOutputMean = avg(eng.map((w) => w.outputIndex));
const engAiMean = avg(eng.map((w) => w.aiSpend));
const SHRINK = 5; // pulls small cohorts toward the company mean

export function modelHire(country: CountryCode, model: WorkerType) {
  const c = countryByCode[country];
  const cohort = eng.filter((w) => w.country === country);
  // Normalize contractor rates back to an employee-equivalent base.
  const base = avg(cohort.map((w) => (w.workerType === "Contractor" ? w.baseSalary / 1.18 : w.baseSalary)));
  const software = teamById.platform.softwareMonthly;
  const breakdown =
    model === "Contractor"
      ? { base: base * 1.18, taxes: 0, benefits: 0, fees: 49, equipment: 0, software, ai: engAiMean }
      : {
          base,
          taxes: base * c.employerTaxRate,
          benefits: c.benefitsMonthly,
          fees: model === "EOR" ? 620 : 35,
          equipment: 95,
          software,
          ai: engAiMean,
        };
  const monthly = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const cohortOutput = avg(cohort.map((w) => w.outputIndex));
  const expectedOutput = (cohort.length * cohortOutput + SHRINK * engOutputMean) / (cohort.length + SHRINK);
  return {
    monthly,
    annual: monthly * 12 * HIRES,
    breakdown,
    cohortSize: cohort.length,
    cohortOutput,
    expectedOutput,
  };
}

export const usBenchmark = modelHire("US", "Employee");

const complianceScore = { Low: 1, Medium: 0.6, High: 0.2 } as const;
const talentScore = { High: 1, Medium: 0.7, Low: 0.4 } as const;
const speedScore: Record<string, number> = {
  "7–14 days": 1,
  "10–18 days": 0.9,
  "14–21 days": 0.8,
  "14–28 days": 0.7,
};

const markets: { country: CountryCode; model: WorkerType; note: string }[] = [
  { country: "PL", model: "EOR", note: "Largest existing engineering hub; strong senior backend supply." },
  { country: "BR", model: "Contractor", note: "Fastest to start. Long-term full-time contractor roles carry misclassification risk." },
  { country: "NG", model: "EOR", note: "Existing Platform team in Lagos; overlapping hours with EMEA." },
  { country: "PT", model: "EOR", note: "Strong output profile; smaller talent pool for senior backend." },
];

export const hiringOptions: HiringOption[] = markets.map(({ country, model, note }) => {
  const c = countryByCode[country];
  const m = modelHire(country, model);
  const complexity = model === "Contractor" ? "Medium" : c.complianceComplexity;
  const delta = m.monthly / usBenchmark.monthly - 1;
  const score =
    0.4 * -delta + // cost advantage
    0.3 * (m.expectedOutput / 100) +
    0.15 * complianceScore[complexity] +
    0.1 * talentScore[c.talentAvailability] +
    0.05 * (speedScore[c.timeToHire] ?? 0.7);
  return {
    id: `${country}-${model}`,
    country,
    model,
    annualCost: m.annual,
    monthlyPerHire: m.monthly,
    timeToHire: c.timeToHire,
    talentAvailability: c.talentAvailability,
    complianceComplexity: complexity,
    expectedOutput: Math.round(m.expectedOutput),
    deltaVsBenchmark: delta,
    cohortSize: m.cohortSize,
    score,
    note,
  };
});

export const recommended = [...hiringOptions].sort((a, b) => b.score - a.score)[0];
export const modeledSavings = usBenchmark.annual - recommended.annualCost;
export const engineeringOutputMean = engOutputMean;

export interface DecisionTarget {
  country: CountryCode;
  model: WorkerType;
  annualCost: number;
  hub: string;
}

const hubs: Partial<Record<CountryCode, string>> = { NG: "Lagos", PL: "Warsaw", BR: "São Paulo", PT: "Lisbon" };

/** The scenario each advisor answer hands to Deel Hire, Finance and Workforce Planning. */
export function decisionTarget(scenario: "hire10" | "compare" | "model" | "reduce" | null): DecisionTarget {
  const pick = scenario === "compare" ? hiringOptions.find((o) => o.country === "PL")! : recommended;
  return { country: pick.country, model: pick.model, annualCost: pick.annualCost, hub: hubs[pick.country] ?? "" };
}

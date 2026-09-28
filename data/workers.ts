import type { CountryCode, TeamId, Worker, WorkerType } from "@/types";
import { countries, countryByCode } from "./countries";
import { teams, teamById } from "./teams";
import { namePools } from "./names";
import { gaussian, mulberry32 } from "@/lib/rng";

/**
 * Northwind Labs — fictional workforce of 180 people.
 *
 * Every figure in Sage is derived from this list, so totals reconcile across
 * Overview, Team Economics, AI Spend and Hiring Advisor.
 */

export const TOTAL_MONTHLY_COST_TARGET = 2_840_400;

// Headcount by country × team. Rows sum to country headcount, columns to team headcount.
const allocation: Record<CountryCode, Record<TeamId, number>> = {
  US: { platform: 4, product: 5, data: 3, sales: 10, success: 4, ga: 8 },
  UK: { platform: 2, product: 3, data: 1, sales: 8, success: 5, ga: 3 },
  DE: { platform: 3, product: 4, data: 2, sales: 5, success: 2, ga: 2 },
  PL: { platform: 6, product: 7, data: 3, sales: 2, success: 3, ga: 3 },
  PT: { platform: 2, product: 4, data: 1, sales: 3, success: 4, ga: 2 },
  BR: { platform: 2, product: 4, data: 2, sales: 4, success: 5, ga: 1 },
  NG: { platform: 5, product: 3, data: 2, sales: 2, success: 5, ga: 3 },
  IN: { platform: 4, product: 4, data: 2, sales: 4, success: 8, ga: 6 },
};

// Contractors per country. US non-contractors are direct employees (Northwind's only entity); elsewhere EOR.
const contractorCount: Record<CountryCode, number> = {
  US: 7, UK: 5, DE: 4, PL: 6, PT: 4, BR: 8, NG: 4, IN: 7,
};

const levels = [
  { level: "Associate", mult: 0.72, w: 0.15 },
  { level: "Mid", mult: 0.9, w: 0.35 },
  { level: "Senior", mult: 1.1, w: 0.32 },
  { level: "Staff", mult: 1.32, w: 0.1 },
  { level: "Lead", mult: 1.28, w: 0.08 },
] as const;

const titles: Record<TeamId, { base: string[]; staff: string; lead: string }> = {
  platform: { base: ["Backend Engineer", "Platform Engineer", "Site Reliability Engineer", "Infrastructure Engineer"], staff: "Staff Engineer", lead: "Engineering Manager, Platform" },
  product: { base: ["Full-stack Engineer", "Frontend Engineer", "Mobile Engineer", "Product Engineer"], staff: "Staff Product Engineer", lead: "Engineering Manager, Product" },
  data: { base: ["Data Engineer", "Analytics Engineer", "ML Engineer", "Data Scientist"], staff: "Staff Data Engineer", lead: "Data Lead" },
  sales: { base: ["Account Executive", "Sales Engineer", "Business Development Rep", "Enterprise Account Executive"], staff: "Principal Account Executive", lead: "Sales Manager" },
  success: { base: ["Customer Success Manager", "Support Specialist", "Implementation Manager", "Solutions Consultant"], staff: "Principal CSM", lead: "CS Team Lead" },
  ga: { base: ["Finance Analyst", "People Partner", "Recruiter", "Accountant", "IT Specialist", "Legal Counsel"], staff: "Senior Finance Manager", lead: "People Operations Lead" },
};

const FEES: Record<WorkerType, number> = { EOR: 620, Contractor: 49, Employee: 35 };
const EQUIPMENT: Record<WorkerType, number> = { EOR: 95, Contractor: 0, Employee: 95 };

interface Pinned {
  name: string;
  country: CountryCode;
  team: TeamId;
  workerType: WorkerType;
  role: string;
  level: Worker["level"];
  fullyLoaded?: number;
  outputIndex: number;
  aiSpend?: number;
}

// Named records referenced by insights and the guided tour.
const pinned: Pinned[] = [
  { name: "Alex Morgan", country: "US", team: "platform", workerType: "Employee", role: "Staff Engineer", level: "Staff", fullyLoaded: 33900, outputIndex: 54, aiSpend: 2310 },
  { name: "Chinedu Okafor", country: "NG", team: "platform", workerType: "EOR", role: "Senior Backend Engineer", level: "Senior", fullyLoaded: 9600, outputIndex: 91, aiSpend: 412 },
  { name: "Marcus Hale", country: "US", team: "platform", workerType: "Employee", role: "Senior Platform Engineer", level: "Senior", outputIndex: 84, aiSpend: 5120 },
  { name: "Lena Vogel", country: "DE", team: "product", workerType: "EOR", role: "Senior Full-stack Engineer", level: "Senior", outputIndex: 71, aiSpend: 4610 },
  { name: "Rohan Iyer", country: "IN", team: "data", workerType: "EOR", role: "ML Engineer", level: "Mid", outputIndex: 63, aiSpend: 4220 },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function pickLevel(rng: () => number) {
  let r = rng();
  for (const l of levels) {
    if ((r -= l.w) <= 0) return l;
  }
  return levels[1];
}

function roleFor(team: TeamId, level: Worker["level"], rng: () => number) {
  const t = titles[team];
  if (level === "Staff") return t.staff;
  if (level === "Lead") return t.lead;
  const base = t.base[Math.floor(rng() * t.base.length)];
  if (level === "Senior") return `Senior ${base}`;
  if (level === "Associate") return team === "sales" ? "Sales Development Rep" : `Associate ${base}`;
  return base;
}

type Draft = Omit<Worker, "employerTaxes" | "fullyLoadedMonthlyCost"> & {
  levelMult: number;
  pinnedTotal?: number;
  pinnedAi?: boolean;
};

function build(): Worker[] {
  const rng = mulberry32(20260928);
  const used = new Set(pinned.map((p) => p.name));
  const drafts: Draft[] = [];
  let seq = 1;

  for (const country of countries) {
    const pool = namePools[country.code];
    const slots: TeamId[] = [];
    for (const team of teams) {
      for (let i = 0; i < allocation[country.code][team.id]; i++) slots.push(team.id);
    }

    // Deterministically choose contractor slots, never on pinned slots.
    const pinsHere = pinned.filter((p) => p.country === country.code);
    const pinSlotIdx = new Map<number, Pinned>();
    for (const p of pinsHere) {
      const idx = slots.findIndex((t, i) => t === p.team && !pinSlotIdx.has(i));
      pinSlotIdx.set(idx, p);
    }
    const candidates = slots.map((_, i) => i).filter((i) => !pinSlotIdx.has(i));
    const contractorIdx = new Set<number>();
    while (contractorIdx.size < contractorCount[country.code]) {
      contractorIdx.add(candidates[Math.floor(rng() * candidates.length)]);
    }

    let nameCursor = 0;
    slots.forEach((teamId, i) => {
      const team = teamById[teamId];
      const pin = pinSlotIdx.get(i);
      let name: string;
      if (pin) {
        name = pin.name;
      } else {
        do {
          const f = pool.first[nameCursor % pool.first.length];
          const l = pool.last[(nameCursor * 7 + 3) % pool.last.length];
          name = `${f} ${l}`;
          nameCursor++;
        } while (used.has(name));
        used.add(name);
      }

      const lvl = pin ? levels.find((l) => l.level === pin.level)! : pickLevel(rng);
      const level = lvl.level as Worker["level"];
      const workerType: WorkerType = pin
        ? pin.workerType
        : contractorIdx.has(i)
          ? "Contractor"
          : country.code === "US"
            ? "Employee"
            : "EOR";
      const role = pin ? pin.role : roleFor(teamId, level, rng);
      const seniorityBoost = level === "Senior" || level === "Staff" ? 2 : level === "Associate" ? -3 : 0;
      const outputIndex = pin
        ? pin.outputIndex
        : Math.round(Math.min(97, Math.max(52, team.outputMean + seniorityBoost + gaussian(rng) * 7.5)));
      const jitter = 0.9 + rng() * 0.2;
      const contractorPremium = workerType === "Contractor" ? 1.18 : 1;
      const year = 2019 + Math.floor(rng() * 7);
      const month = 1 + Math.floor(rng() * 12);

      drafts.push({
        id: `w-${String(seq++).padStart(3, "0")}`,
        name,
        initials: initials(name),
        role,
        level,
        team: teamId,
        country: country.code,
        workerType,
        baseSalary: team.baseUSMonthly * lvl.mult * country.compMultiplier * jitter * contractorPremium,
        benefits: workerType === "Contractor" ? 0 : country.benefitsMonthly,
        deelFees: FEES[workerType],
        equipmentCost: EQUIPMENT[workerType],
        softwareCost: team.softwareMonthly,
        aiSpend: pin?.aiSpend ?? 0,
        pinnedAi: pin?.aiSpend !== undefined,
        outputIndex,
        startDate: `${year}-${String(month).padStart(2, "0")}-01`,
        levelMult: lvl.mult,
        pinnedTotal: pin?.fullyLoaded,
      });
    });
  }

  // 1. Allocate each team's AI spend across its workers so team totals reconcile exactly.
  for (const team of teams) {
    const members = drafts.filter((d) => d.team === team.id);
    const fixed = members.filter((m) => m.pinnedAi).reduce((s, m) => s + m.aiSpend, 0);
    const flexible = members.filter((m) => !m.pinnedAi);
    const weights = flexible.map((m) => (team.isEngineering ? 0.45 : 0.25) + rng() * rng() * 1.6 + m.levelMult * 0.2);
    const wSum = weights.reduce((a, b) => a + b, 0);
    let allocated = 0;
    flexible.forEach((m, i) => {
      m.aiSpend = Math.round(((team.aiSpend - fixed) * weights[i]) / wSum);
      allocated += m.aiSpend;
    });
    flexible[flexible.length - 1].aiSpend += team.aiSpend - fixed - allocated;
  }

  // 2. Calibrate base compensation so the company total matches the payroll-derived total.
  const taxRate = (d: Draft) => (d.workerType === "Contractor" ? 0 : countryByCode[d.country].employerTaxRate);
  const fixedParts = (d: Draft) => d.benefits + d.deelFees + d.equipmentCost + d.softwareCost + d.aiSpend;

  for (const d of drafts) {
    if (d.pinnedTotal) d.baseSalary = (d.pinnedTotal - fixedParts(d)) / (1 + taxRate(d));
  }
  const pinnedSum = drafts.filter((d) => d.pinnedTotal).reduce((s, d) => s + d.pinnedTotal!, 0);
  const flex = drafts.filter((d) => !d.pinnedTotal);
  const flexFixed = flex.reduce((s, d) => s + fixedParts(d), 0);
  const flexVariable = flex.reduce((s, d) => s + d.baseSalary * (1 + taxRate(d)), 0);
  const k = (TOTAL_MONTHLY_COST_TARGET - pinnedSum - flexFixed) / flexVariable;

  const workers: Worker[] = drafts.map((d) => {
    const base = Math.round(d.pinnedTotal ? d.baseSalary : d.baseSalary * k);
    const employerTaxes = Math.round(base * taxRate(d));
    const total = base + employerTaxes + fixedParts(d);
    const { levelMult: _l, pinnedTotal: _p, pinnedAi: _a, ...rest } = d;
    void _l; void _p; void _a;
    return { ...rest, baseSalary: base, employerTaxes, fullyLoadedMonthlyCost: total };
  });

  // Absorb rounding drift so the total reconciles to the dollar.
  const drift = TOTAL_MONTHLY_COST_TARGET - workers.reduce((s, w) => s + w.fullyLoadedMonthlyCost, 0);
  const adj = workers.find((w) => w.team === "ga" && w.country === "US")!;
  adj.baseSalary += drift;
  adj.fullyLoadedMonthlyCost += drift;

  return workers;
}

export const workers: Worker[] = build();

export const workerById = Object.fromEntries(workers.map((w) => [w.id, w])) as Record<string, Worker>;

export const findWorker = (name: string) => workers.find((w) => w.name === name)!;

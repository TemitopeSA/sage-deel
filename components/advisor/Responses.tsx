"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CircleCheck, Info, Route, TrendingDown, UserX, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScenarioTable } from "./ScenarioTable";
import { DecisionActions } from "./DecisionActions";
import { countryByCode } from "@/data/countries";
import { hiringOptions, HIRES, modelHire, modeledSavings, recommended, usBenchmark } from "@/data/hiringScenarios";
import { unusedSeats } from "@/data/aiSpend";
import { routingSavingsMonthly } from "@/lib/aiMetrics";
import { countryRow, engineering } from "@/lib/metrics";
import { useTypewriter } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import { money, pct } from "@/lib/utils";
import type { HiringOption } from "@/types";

export function Lead({ text, animate }: { text: string; animate: boolean }) {
  const shown = useTypewriter(text, animate);
  return (
    <p className="text-[15px] leading-relaxed text-ink">
      {shown}
      {shown.length < text.length && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brand" />}
    </p>
  );
}

function Disclaimer() {
  return (
    <p className="flex items-start gap-1.5 text-[11.5px] text-subtle">
      <Info className="mt-px size-3.5 shrink-0" />
      Illustrative scenario using fictional workforce data. Not legal, tax, compensation, or hiring advice, and not Deel pricing.
    </p>
  );
}

function Sources({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
      <span>Sources</span>
      {items.map((s) => (
        <span key={s} className="rounded-md border border-line bg-surface px-1.5 py-0.5">{s}</span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero: "I need 10 more backend engineers. Where should I hire them?"

export function HireResponse({ animate }: { animate: boolean }) {
  const r = recommended;
  const c = countryByCode[r.country];
  const cohort = countryRow(r.country).engineering;
  const others = hiringOptions.filter((o) => o.id !== r.id);
  const cheapest = [...hiringOptions].sort((a, b) => a.annualCost - b.annualCost)[0];
  const deepest = hiringOptions.find((o) => o.country === "PL")!;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-[12.5px] text-muted">
          Based on {engineering.headcount} engineering workers across {engineering.countries} markets, compared against your US engineering cohort and modeled with illustrative workforce cost data.
        </p>
        <Lead animate={animate} text={`Based on your current workforce economics, I found ${hiringOptions.length} viable options.`} />
      </div>

      <div className="animate-fade-up [animation-delay:250ms]">
        <ScenarioTable options={hiringOptions} recommendedId={r.id} />
        <p className="mt-2 text-[11.5px] text-subtle">
          US benchmark: {money(usBenchmark.annual, { compact: true })} for {HIRES} hires at {money(usBenchmark.monthly)}/mo fully loaded. Expected output is your in-market cohort average, adjusted for cohort size.
        </p>
      </div>

      <div className="animate-fade-up overflow-hidden rounded-2xl border border-brand/25 bg-surface shadow-lift [animation-delay:500ms]" data-tour="recommendation">
        <div className="flex items-center justify-between gap-3 border-b border-line-2 bg-gradient-to-r from-brand-50 to-surface px-5 py-3.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-brand-700">Best fit for Northwind Labs</p>
          <Badge tone="positive"><CircleCheck />High confidence</Badge>
        </div>
        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">What</p>
            <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">{c.name} — {r.model}</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">Why</p>
            <ul className="mt-1.5 space-y-2 text-[13.5px] text-ink-2">
              <li className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />{pct(-r.deltaVsBenchmark, { signed: false })} lower modeled workforce cost than your US engineering benchmark</li>
              <li className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />Your {cohort.headcount} engineers in {c.name} average an Output Index of {cohort.output.toFixed(0)}, in line with your strongest engineering cohorts</li>
              <li className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />Low modeled compliance complexity under EOR in this scenario</li>
              <li className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />Existing Platform team and {c.timezone} overlap with EMEA make onboarding and management simpler</li>
            </ul>
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">Impact</p>
            <dl className="mt-1.5 divide-y divide-line-2 rounded-xl border border-line-2">
              <div className="flex items-baseline justify-between px-4 py-3">
                <dt className="text-[12.5px] text-muted">Estimated annual workforce cost</dt>
                <dd className="num text-[18px] font-semibold">{money(r.annualCost, { compact: true })}</dd>
              </div>
              <div className="flex items-baseline justify-between px-4 py-3">
                <dt className="text-[12.5px] text-muted">Modeled annual savings vs US</dt>
                <dd className="num text-[18px] font-semibold text-pos">{money(modeledSavings, { compact: true })}</dd>
              </div>
              <div className="flex items-baseline justify-between px-4 py-3">
                <dt className="text-[12.5px] text-muted">Expected capacity</dt>
                <dd className="num text-[18px] font-semibold">+{HIRES} engineers</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              <span className="font-medium text-ink-2">Worth weighing:</span> {countryByCode[cheapest.country].name} {cheapest.model.toLowerCase()} is {cheapest.id === r.id ? "also the lowest-cost option" : `cheapest and fastest to start, but long-term full-time contractors carry misclassification risk`}. {countryByCode[deepest.country].name} has your deepest senior backend bench if you split the hires.
            </p>
          </div>
        </div>
        <div className="border-t border-line-2 bg-[#fbfaf7] px-5 py-4">
          <DecisionActions />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Sources items={["Deel HRIS", "Deel Payroll", "Deel EOR", "GitHub", "Jira", "Global Salary Insights"]} />
        <span className="text-[11.5px] text-subtle">Also considered: {others.map((o) => countryByCode[o.country].name).join(", ")}</span>
      </div>
      <Disclaimer />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function CompareResponse({ animate }: { animate: boolean }) {
  const pl = hiringOptions.find((o) => o.country === "PL")!;
  const brC = hiringOptions.find((o) => o.country === "BR")!;
  const brE = modelHire("BR", "EOR");
  const brEor: HiringOption = {
    ...brC,
    id: "BR-EOR",
    model: "EOR",
    annualCost: brE.annual,
    monthlyPerHire: brE.monthly,
    complianceComplexity: "Medium",
    deltaVsBenchmark: brE.monthly / usBenchmark.monthly - 1,
  };
  return (
    <div className="space-y-5">
      <Lead animate={animate} text={`Poland and Brazil both work for backend hiring, but they optimize for different things.`} />
      <div className="animate-fade-up [animation-delay:250ms]">
        <ScenarioTable options={[pl, brEor, brC]} />
      </div>
      <div className="grid animate-fade-up grid-cols-1 gap-3 [animation-delay:450ms] md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-[13.5px] font-semibold">Choose Poland if…</p>
          <p className="mt-1 text-[13px] text-muted">You need senior depth and CET overlap with your largest engineering hub ({countryRow("PL").engineering.headcount} engineers today). Low compliance complexity under EOR.</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-[13.5px] font-semibold">Choose Brazil if…</p>
          <p className="mt-1 text-[13px] text-muted">Speed matters most (7–14 days) and Americas coverage helps. For full-time roles, EOR avoids the classification risk of long-term contractors, at {pct(brE.annual / brC.annualCost - 1)} higher cost.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-[#fbfaf7] p-4"><DecisionActions /></div>
      <Sources items={["Deel HRIS", "Deel EOR", "Deel Contractor", "Global Salary Insights"]} />
      <Disclaimer />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function ModelResponse({ animate }: { animate: boolean }) {
  const eor = modelHire("NG", "EOR");
  const con = modelHire("NG", "Contractor");
  const rows = [
    { l: "Monthly cost per hire", e: money(eor.monthly), c: money(con.monthly) },
    { l: `Annual cost, ${HIRES} hires`, e: money(eor.annual, { compact: true }), c: money(con.annual, { compact: true }) },
    { l: "Employer contributions & benefits", e: "Included", c: "None" },
    { l: "Classification risk for full-time roles", e: "Low", c: "Elevated" },
    { l: "Equipment via Deel IT", e: "Included", c: "Optional" },
  ];
  return (
    <div className="space-y-5">
      <Lead animate={animate} text={`For 10 full-time backend engineers in Nigeria, EOR is the better fit. Contractors cost ${pct(1 - con.annual / eor.annual, { signed: false })} less on paper, but not for this kind of role.`} />
      <div className="animate-fade-up overflow-hidden rounded-xl border border-line [animation-delay:250ms]">
        <table className="w-full text-[13px]">
          <caption className="sr-only">EOR vs contractor comparison</caption>
          <thead>
            <tr className="border-b border-line-2 bg-[#fbfaf7] text-left text-[12px] text-muted">
              <th scope="col" className="py-2.5 pl-4 font-medium" />
              <th scope="col" className="py-2.5 font-medium"><Badge tone="brand">EOR</Badge></th>
              <th scope="col" className="py-2.5 pr-4 font-medium"><Badge tone="sun">Contractor</Badge></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.l} className="border-b border-line-2 last:border-0">
                <th scope="row" className="py-2.5 pl-4 text-left font-normal text-muted">{r.l}</th>
                <td className="num py-2.5 font-medium">{r.e}</td>
                <td className="num py-2.5 pr-4 font-medium">{r.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13.5px] leading-relaxed text-ink-2">
        These roles are ongoing, full-time and embedded in your Platform team, which is where contractor arrangements carry the most classification risk. Contractors make sense for scoped, project-based work like a 4-month migration.
      </p>
      <div className="rounded-2xl border border-line bg-[#fbfaf7] p-4"><DecisionActions /></div>
      <Disclaimer />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function ReduceResponse({ animate }: { animate: boolean }) {
  const router = useRouter();
  const { setSmartRouting, openModal } = useApp();
  const ng = modelHire("NG", "EOR");
  const backfillSavings = (usBenchmark.monthly - ng.monthly) * 12 * 4;
  const items = [
    {
      icon: Route,
      title: "Enable AI Smart Routing",
      value: `${money(routingSavingsMonthly)}/mo`,
      body: "Route routine AI workloads to lower-cost approved models. No change to headcount or tools.",
      cta: "Enable in AI Spend",
      run: () => { setSmartRouting(true); router.push("/sage/ai-spend"); },
    },
    {
      icon: Users,
      title: "Place 4 planned US backfills in existing hubs",
      value: `${money(backfillSavings, { compact: true })}/yr`,
      body: "Only for roles already opening through attrition. Poland and Nigeria have comparable output profiles.",
      cta: "Create workforce plan",
      run: () => openModal("plan"),
    },
    {
      icon: UserX,
      title: "Reclaim unused AI seats",
      value: `${money(unusedSeats.reduce((s, x) => s + x.cost, 0))}/mo`,
      body: `${unusedSeats.length} seats inactive for 30+ days. Reassign to incoming hires via Deel IT.`,
      cta: "Review seats",
      run: () => router.push("/sage/ai-spend#signals"),
    },
  ];
  return (
    <div className="space-y-5">
      <Lead animate={animate} text="I found 3 ways to lower cost while keeping headcount and output flat. None involve reducing your team." />
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={it.title} className="flex animate-fade-up items-center gap-4 rounded-xl border border-line bg-surface p-4" style={{ animationDelay: `${200 + i * 150}ms` }}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pos-50 text-pos"><it.icon className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{it.title}</p>
              <p className="text-[12.5px] text-muted">{it.body}</p>
            </div>
            <div className="text-right">
              <p className="num flex items-center justify-end gap-1 text-[16px] font-semibold text-pos"><TrendingDown className="size-4" />{it.value}</p>
              <Button variant="link" className="text-[12.5px]" onClick={it.run}>{it.cta} <ArrowRight className="!size-3" /></Button>
            </div>
          </li>
        ))}
      </ul>
      <Disclaimer />
    </div>
  );
}

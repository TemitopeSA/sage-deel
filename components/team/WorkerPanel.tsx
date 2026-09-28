"use client";

import * as React from "react";
import { ArrowUpRight, ShieldCheck, Users } from "lucide-react";
import { Sheet } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breakdown, InfoTip } from "@/components/ui/info-tip";
import { workerById, workers } from "@/data/workers";
import { teamById } from "@/data/teams";
import { countryByCode } from "@/data/countries";
import { costPerOutput, workerBenchmark } from "@/lib/metrics";
import { useApp } from "@/lib/store";
import { cn, money } from "@/lib/utils";
import type { Worker } from "@/types";

export function WorkerPanel() {
  const { workerId, openWorker } = useApp();
  const w = workerId ? workerById[workerId] : null;
  return (
    <Sheet open={!!w} onOpenChange={(o) => !o && openWorker(null)} title={w?.name ?? "Worker"}>
      {w && <WorkerDetail key={w.id} w={w} />}
    </Sheet>
  );
}

function WorkerDetail({ w }: { w: Worker }) {
  const { toast } = useApp();
  const [showCohort, setShowCohort] = React.useState(false);
  const team = teamById[w.team];
  const b = workerBenchmark(w);
  const below = b.delta < 0;
  const outlier = Math.abs(b.delta) > 0.2;
  const cohort = workers
    .filter((x) => x.team === w.team)
    .map((x) => ({ id: x.id, v: costPerOutput(x.fullyLoadedMonthlyCost, x.outputIndex) }))
    .sort((a, c) => a.v - c.v);
  const maxV = cohort.at(-1)!.v;
  const rank = cohort.findIndex((c) => c.id === w.id) + 1;

  return (
    <>
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="border-b border-line-2 p-6 pr-14">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full text-[14px] font-semibold text-white" style={{ background: team.color }}>
              {w.initials}
            </span>
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.01em]">{w.name}</p>
              <p className="text-[13px] text-muted">{w.role}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{team.name}</Badge>
            <Badge>{countryByCode[w.country].name}</Badge>
            <Badge tone={w.workerType === "EOR" ? "brand" : w.workerType === "Contractor" ? "sun" : "neutral"}>{w.workerType}</Badge>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-line-2">
          <div className="bg-surface px-6 py-4">
            <dt className="flex items-center gap-1 text-[12px] text-muted">
              Fully loaded cost
              <InfoTip label="Fully loaded cost">
                <Breakdown
                  title="Monthly fully loaded cost"
                  rows={[
                    { label: "Base compensation", value: money(w.baseSalary) },
                    { label: "Employer taxes", value: money(w.employerTaxes) },
                    { label: "Benefits", value: money(w.benefits) },
                    { label: "Platform fees", value: money(w.deelFees) },
                    { label: "Equipment", value: money(w.equipmentCost) },
                    { label: "Software", value: money(w.softwareCost) },
                    { label: "AI spend", value: money(w.aiSpend) },
                  ]}
                  total={{ label: "Total", value: money(w.fullyLoadedMonthlyCost) }}
                />
              </InfoTip>
            </dt>
            <dd className="num mt-1 text-[20px] font-semibold">{money(w.fullyLoadedMonthlyCost)}<span className="text-[13px] font-normal text-muted">/mo</span></dd>
          </div>
          <div className="bg-surface px-6 py-4">
            <dt className="text-[12px] text-muted">Output index</dt>
            <dd className="num mt-1 text-[20px] font-semibold">{w.outputIndex}<span className="text-[13px] font-normal text-muted"> / team {b.teamAvgOutput.toFixed(0)}</span></dd>
          </div>
          <div className="bg-surface px-6 py-4">
            <dt className="text-[12px] text-muted">AI spend</dt>
            <dd className="num mt-1 text-[20px] font-semibold">{money(w.aiSpend)}<span className="text-[13px] font-normal text-muted">/mo</span></dd>
          </div>
          <div className="bg-surface px-6 py-4">
            <dt className="text-[12px] text-muted">Cost / output pt</dt>
            <dd className="num mt-1 text-[20px] font-semibold">{money(b.own)}<span className="text-[13px] font-normal text-muted"> / team {money(b.team)}</span></dd>
          </div>
        </dl>

        <div className="p-6">
          <div className={cn("rounded-xl px-4 py-3", below ? "bg-pos-50" : outlier ? "bg-warn-50" : "bg-canvas")}>
            <p className={cn("text-[13.5px] font-semibold", below ? "text-pos" : outlier ? "text-warn" : "text-ink")}>
              {Math.abs(Math.round(b.delta * 100))}% {below ? "below" : "above"} team cost/output benchmark
            </p>
            <p className="mt-1 text-[12.5px] text-ink-2">
              {outlier
                ? below
                  ? "Cost/output outlier. Worth understanding what's working and whether it's repeatable for the team."
                  : "Cost/output outlier. Review contributing factors (role scope, on-call load, onboarding, data gaps) before drawing conclusions."
                : "Within the normal range for this cohort."}
            </p>
          </div>

          <p className="mt-5 text-[13px] font-semibold">Contributing signals</p>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {team.outputSignals.map((s, i) => {
              const gap = w.outputIndex - b.teamAvgOutput;
              const pattern = gap >= 5 ? ["Above", "Above", "In line with"] : gap <= -5 ? ["Below", "In line with", "Below"] : ["In line with", "Above", "In line with"];
              return (
                <li key={s} className="flex justify-between">
                  <span className="text-muted">{s}</span>
                  <span className="font-medium">{pattern[i % 3]} cohort</span>
                </li>
              );
            })}
          </ul>

          {showCohort && (
            <div className="mt-5 animate-fade-up">
              <p className="text-[13px] font-semibold">{team.name} cohort · cost per output point</p>
              <div className="relative mt-3 h-10" role="img" aria-label={`${w.name} ranks ${rank} of ${cohort.length} on cost per output point, lowest first.`}>
                <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
                {cohort.map((c) => (
                  <span
                    key={c.id}
                    className={cn("absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full", c.id === w.id ? "z-10 size-3.5 ring-2 ring-white" : "size-2 opacity-40")}
                    style={{ left: `${(c.v / maxV) * 96 + 2}%`, background: team.color }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-subtle">
                <span>Lower cost / output</span>
                <span>Higher</span>
              </div>
              <p className="mt-2 text-[12.5px] text-muted">
                #{rank} of {cohort.length} (lowest first) · team avg AI spend {money(b.teamAvgAi)}/mo
              </p>
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-line-2 bg-[#fbfaf7] p-3 text-[12px] text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            Planning signal, not a performance rating. Individual views are limited to Finance and People admins; employment decisions should follow your standard review process.
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-t border-line-2 p-4">
        <Button className="flex-1" onClick={() => setShowCohort((s) => !s)} aria-expanded={showCohort}>
          <Users /> {showCohort ? "Hide cohort" : "Compare cohort"}
        </Button>
        <Button
          variant="dark"
          className="flex-1"
          onClick={() => toast("Opens the worker profile in Deel People", "Concept flow — profile view is outside this prototype.")}
        >
          View worker <ArrowUpRight />
        </Button>
      </div>
    </>
  );
}

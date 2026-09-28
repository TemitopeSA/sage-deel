"use client";

import * as React from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { SearchX } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { teams, teamById } from "@/data/teams";
import { countryByCode } from "@/data/countries";
import { avg, defaultFilters, filterWorkers } from "@/lib/metrics";
import { useApp } from "@/lib/store";
import { money } from "@/lib/utils";
import type { Worker } from "@/types";

const LABELLED = ["Alex Morgan", "Chinedu Okafor"];

function TooltipCard({ active, payload }: { active?: boolean; payload?: { payload: Worker }[] }) {
  if (!active || !payload?.length) return null;
  const w = payload[0].payload;
  const t = teamById[w.team];
  return (
    <div className="w-60 rounded-xl border border-line bg-surface p-3 text-[12.5px] shadow-pop">
      <p className="font-semibold text-ink">{w.name}</p>
      <p className="text-muted">{w.role}</p>
      <p className="mt-1 flex items-center gap-1.5 text-muted">
        <span className="size-2 rounded-full" style={{ background: t.color }} />
        {t.name} · {countryByCode[w.country].name} · {w.workerType}
      </p>
      <dl className="mt-2.5 grid grid-cols-3 gap-2 border-t border-line-2 pt-2.5">
        <div><dt className="text-[11px] text-subtle">Cost</dt><dd className="num font-semibold">{money(w.fullyLoadedMonthlyCost, { compact: true })}</dd></div>
        <div><dt className="text-[11px] text-subtle">Output</dt><dd className="num font-semibold">{w.outputIndex}</dd></div>
        <div><dt className="text-[11px] text-subtle">AI spend</dt><dd className="num font-semibold">{money(w.aiSpend)}</dd></div>
      </dl>
      <p className="mt-2 text-[11px] text-subtle">Click for details</p>
    </div>
  );
}

export function CostOutputScatter() {
  const { filters, setFilters, openWorker, workerId } = useApp();
  const list = filterWorkers(filters);
  const avgCost = avg(list.map((w) => w.fullyLoadedMonthlyCost));
  const avgOut = avg(list.map((w) => w.outputIndex));
  const present = teams.filter((t) => list.some((w) => w.team === t.id));

  return (
    <Card data-tour="scatter">
      <CardHeader
        title="Cost vs output"
        description={`${list.length} workers · fully loaded monthly cost vs Output Index · each dot is one person`}
        action={
          <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-[12px] text-muted">
            {present.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: t.color }} />
                {t.short}
              </span>
            ))}
          </div>
        }
      />
      {list.length === 0 ? (
        <div className="grid h-[380px] place-items-center px-5 text-center">
          <div>
            <SearchX className="mx-auto size-6 text-subtle" />
            <p className="mt-2 text-[14px] font-medium">No workers match these filters</p>
            <p className="mt-1 text-[13px] text-muted">Try widening the team, country or worker type.</p>
            <Button className="mt-4" size="sm" onClick={() => setFilters(defaultFilters)}>Reset filters</Button>
          </div>
        </div>
      ) : (
        <div
          className="h-[380px] px-2 pb-2 pt-3"
          role="img"
          aria-label={`Scatter plot of ${list.length} workers. Average cost ${money(avgCost)}, average output ${avgOut.toFixed(0)}. Notable outliers: Alex Morgan, high cost and below-cohort output; Chinedu Okafor, low cost and high output.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 28, bottom: 24, left: 8 }}>
              <CartesianGrid stroke="#efece6" />
              <XAxis
                type="number"
                dataKey="fullyLoadedMonthlyCost"
                name="Cost"
                tickFormatter={(v) => `$${Math.round(v / 1000)}K`}
                tick={{ fontSize: 11, fill: "#9b99a2" }}
                tickLine={false}
                axisLine={{ stroke: "#e6e2da" }}
                domain={[0, "auto"]}
                label={{ value: "Fully loaded monthly cost", position: "insideBottom", offset: -14, fontSize: 11, fill: "#6c6a74" }}
              />
              <YAxis
                type="number"
                dataKey="outputIndex"
                name="Output"
                domain={[40, 100]}
                tick={{ fontSize: 11, fill: "#9b99a2" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Output Index", angle: -90, position: "insideLeft", offset: 14, fontSize: 11, fill: "#6c6a74" }}
              />
              <ZAxis range={[64, 64]} />
              <ReferenceLine x={avgCost} stroke="#cfc9bd" strokeDasharray="4 4" label={{ value: "avg cost", position: "top", fontSize: 10, fill: "#9b99a2" }} />
              <ReferenceLine y={avgOut} stroke="#cfc9bd" strokeDasharray="4 4" label={{ value: "avg output", position: "right", fontSize: 10, fill: "#9b99a2" }} />
              <Tooltip content={<TooltipCard />} cursor={{ strokeDasharray: "3 3", stroke: "#cfc9bd" }} isAnimationActive={false} />
              {present.map((t) => (
                <Scatter
                  key={t.id}
                  name={t.name}
                  data={list.filter((w) => w.team === t.id)}
                  fill={t.color}
                  animationDuration={700}
                  onClick={(p: unknown) => {
                    const w = (p as { payload?: Worker }).payload ?? (p as Worker);
                    if (w?.id) openWorker(w.id);
                  }}
                  shape={(props: unknown) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: Worker };
                    const selected = payload.id === workerId;
                    const labelled = LABELLED.includes(payload.name);
                    return (
                      <g style={{ cursor: "pointer" }}>
                        <circle cx={cx} cy={cy} r={12} fill="transparent" />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={selected || labelled ? 6 : 4.5}
                          fill={t.color}
                          fillOpacity={selected || labelled ? 1 : 0.78}
                          stroke="#fff"
                          strokeWidth={selected ? 2.5 : 1.5}
                        />
                        {selected && <circle cx={cx} cy={cy} r={10} fill="none" stroke={t.color} strokeOpacity={0.4} strokeWidth={2} />}
                        {labelled && (
                          <text x={cx + 10} y={cy + 4} fontSize={11} fontWeight={600} fill="#16151b">
                            {payload.name}
                          </text>
                        )}
                      </g>
                    );
                  }}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="border-t border-line-2 px-5 py-3 text-[12px] leading-relaxed text-muted">
        <span className="font-medium text-ink-2">About the Output Index.</span> An illustrative composite based on connected activity signals. It is intended for planning and trend analysis, not individual performance evaluation.
      </p>
    </Card>
  );
}

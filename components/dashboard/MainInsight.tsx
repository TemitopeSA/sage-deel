"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mainInsight } from "@/data/insights";
import { engineeringIndex } from "@/data/history";
import { cn, pct } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { SageMark } from "@/components/layout/SageMark";

export function MainInsight() {
  const { setFilters } = useApp();
  return (
    <Card className="overflow-hidden" data-tour="main-insight">
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr]">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Badge tone="brand">
              <SageMark className="!size-3" />
              Sage insight
            </Badge>
            <span className="text-[12px] text-muted">{mainInsight.context}</span>
          </div>
          <h2 className="mt-3 max-w-[520px] text-[21px] font-semibold leading-snug tracking-[-0.02em]">
            {mainInsight.headline}
          </h2>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {mainInsight.metrics.map((m) => {
              const good = m.good === "neutral" ? null : m.good === "up" ? m.value > 0 : m.value < 0;
              return (
                <div key={m.label} className="bg-surface px-4 py-3">
                  <dt className="text-[12px] leading-tight text-muted">{m.label}</dt>
                  <dd
                    className={cn(
                      "num mt-1.5 text-[22px] font-semibold tracking-[-0.02em]",
                      good === null ? "text-ink" : good ? "text-pos" : "text-risk",
                    )}
                  >
                    {pct(m.value)}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-5 flex items-center gap-4">
            <Link
              href="/sage/team-economics"
              onClick={() => setFilters({ team: "engineering", country: "all", workerType: "all" })}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand transition-colors hover:text-brand-700"
            >
              View team economics <ArrowRight className="size-4" />
            </Link>
            <span className="text-[12px] text-subtle">Sources: GitHub · Jira · Deel Payroll · Deel IT</span>
          </div>
        </div>

        <div className="border-t border-line-2 bg-[#fbfaf7] p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-ink-2">Engineering, indexed (Jun = 100)</p>
            <div className="flex items-center gap-3 text-[12px] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-brand" />Output</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-[#9b99a2]" />Cost</span>
            </div>
          </div>
          <div
            className="mt-3 h-[190px]"
            role="img"
            aria-label={`Engineering output index rose to ${engineeringIndex.at(-1)!.output} while cost index rose to ${engineeringIndex.at(-1)!.cost}, from 100 in June.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engineeringIndex} margin={{ top: 8, right: 40, bottom: 0, left: -18 }}>
                <CartesianGrid vertical={false} stroke="#efece6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9b99a2" }} />
                <YAxis domain={[90, 122]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9b99a2" }} />
                <Tooltip
                  cursor={{ stroke: "#d9d4ca" }}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e6e2da", fontSize: 12, boxShadow: "0 8px 24px -8px rgb(0 0 0 / .15)" }}
                />
                <Line type="monotone" dataKey="cost" name="Cost" stroke="#9b99a2" strokeWidth={2} dot={false} animationDuration={900}
                  label={(p: { index?: number; x?: unknown; y?: unknown; value?: unknown }) =>
                    p.index === engineeringIndex.length - 1 ? (
                      <text key="c" x={Number(p.x) + 6} y={Number(p.y) + 4} fontSize={11} fill="#6c6a74" className="num">{String(p.value)}</text>
                    ) : <g key={p.index} />} />
                <Line type="monotone" dataKey="output" name="Output" stroke="#4b3cf0" strokeWidth={2} dot={false} animationDuration={900}
                  label={(p: { index?: number; x?: unknown; y?: unknown; value?: unknown }) =>
                    p.index === engineeringIndex.length - 1 ? (
                      <text key="o" x={Number(p.x) + 6} y={Number(p.y) + 4} fontSize={11} fontWeight={600} fill="#16151b" className="num">{String(p.value)}</text>
                    ) : <g key={p.index} />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Delta } from "@/components/dashboard/KpiCard";
import { teams } from "@/data/teams";
import { costPerOutput, filterWorkers, summarize } from "@/lib/metrics";
import { useApp } from "@/lib/store";
import { cn, money, pct } from "@/lib/utils";

export function TeamTable() {
  const { filters, setFilters } = useApp();
  const scoped = filterWorkers({ ...filters, team: "all" });
  const rows = teams.map((team) => {
    const s = summarize(scoped.filter((w) => w.team === team.id));
    return { team, ...s, peer: costPerOutput(s.avgCost, s.output) / (1 + team.vsPeerBenchmark) };
  });
  const isActive = (id: string) =>
    filters.team === id || (filters.team === "engineering" && teams.find((t) => t.id === id)?.isEngineering);

  return (
    <Card data-tour="team-table">
      <CardHeader
        title="Team performance"
        description="Select a team to focus the cost vs output chart."
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13px]">
          <caption className="sr-only">Team cost, output and AI spend</caption>
          <thead>
            <tr className="border-y border-line-2 bg-[#fbfaf7] text-left text-[12px] text-muted">
              <th scope="col" className="py-2.5 pl-5 font-medium">Team</th>
              <th scope="col" className="py-2.5 text-right font-medium">Headcount</th>
              <th scope="col" className="py-2.5 text-right font-medium">Monthly cost</th>
              <th scope="col" className="py-2.5 text-right font-medium">Output index</th>
              <th scope="col" className="py-2.5 text-right font-medium">
                <span className="inline-flex items-center gap-1">
                  Cost / output pt
                  <InfoTip label="Cost per output point" align="end">
                    <p className="font-semibold text-ink">Cost per output point</p>
                    <p className="mt-1.5">Average fully loaded monthly cost per worker ÷ average Output Index. Lower means more output per dollar.</p>
                    <p className="mt-2 text-[12px] text-subtle">Peer benchmark: anonymized, aggregated companies of similar size and mix. Illustrative.</p>
                  </InfoTip>
                </span>
              </th>
              <th scope="col" className="py-2.5 text-right font-medium">vs peers</th>
              <th scope="col" className="py-2.5 text-right font-medium">AI spend</th>
              <th scope="col" className="py-2.5 pr-5 text-right font-medium">Cost / output, 90d</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = isActive(r.team.id);
              const change = (1 + r.team.trend.cost) / (1 + r.team.trend.output) - 1;
              return (
                <tr
                  key={r.team.id}
                  className={cn(
                    "cursor-pointer border-b border-line-2 transition-colors last:border-0",
                    active ? "bg-brand-50/60" : "hover:bg-canvas/60",
                  )}
                  onClick={() => setFilters({ team: filters.team === r.team.id ? "all" : r.team.id })}
                >
                  <td className="py-3 pl-5">
                    <button
                      className="flex items-center gap-2.5 font-medium"
                      aria-pressed={!!active}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters({ team: filters.team === r.team.id ? "all" : r.team.id });
                      }}
                    >
                      <span className="size-2.5 rounded-full" style={{ background: r.team.color }} aria-hidden />
                      {r.team.name}
                    </button>
                  </td>
                  <td className="num py-3 text-right text-ink-2">{r.headcount}</td>
                  <td className="num py-3 text-right font-medium">{r.headcount ? money(r.cost, { compact: true }) : "—"}</td>
                  <td className="num py-3 text-right">{r.headcount ? r.output.toFixed(0) : "—"}</td>
                  <td className="num py-3 text-right text-ink-2">{r.headcount ? money(r.costPerOutput) : "—"}</td>
                  <td className="py-3 text-right">
                    <span className={cn("num text-[12.5px] font-medium", r.team.vsPeerBenchmark > 0 ? "text-warn" : "text-pos")}>
                      {pct(r.team.vsPeerBenchmark)}
                      <span className="sr-only">{r.team.vsPeerBenchmark > 0 ? " above peer cost" : " below peer cost"}</span>
                    </span>
                  </td>
                  <td className="num py-3 text-right text-ink-2">{money(r.ai, { compact: true })}</td>
                  <td className="py-3 pr-5 text-right">
                    <Delta value={change} goodWhen="down" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

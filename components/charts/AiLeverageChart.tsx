"use client";

import {
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { Delta } from "@/components/dashboard/KpiCard";
import { byTeam } from "@/lib/metrics";
import { useApp } from "@/lib/store";
import { cn, money, pct } from "@/lib/utils";

type Pt = { name: string; id: string; x: number; y: number; unit: string; cpo: number; color: string; ai: number };

export function AiLeverageChart() {
  const { aiTeam, setAiTeam } = useApp();
  const data: Pt[] = byTeam.map((r) => ({
    name: r.team.short,
    id: r.team.id,
    x: r.aiDelta / 1000,
    y: r.team.trend.output * 100,
    unit: r.team.outputUnit,
    cpo: r.costPerOutputChange,
    color: r.team.color,
    ai: r.team.aiSpend,
  }));
  const best = byTeam.find((r) => r.team.id === "platform")!;
  const weakest = byTeam.find((r) => r.team.id === "data")!;

  return (
    <Card data-tour="ai-vs-output">
      <CardHeader
        title="AI spend vs output improvement"
        description="Change in monthly AI spend vs change in team output, last 90 days"
      />
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_300px]">
        <div
          className="h-[300px] px-2 pt-3"
          role="img"
          aria-label={`Teams plotted by added AI spend and output change. ${data.map((d) => `${d.name}: +$${d.x.toFixed(1)}K AI, ${d.y > 0 ? "+" : ""}${d.y.toFixed(0)}% output`).join("; ")}.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 32, bottom: 24, left: 4 }}>
              <CartesianGrid stroke="#efece6" />
              <ReferenceArea x1={4} x2={10} y1={12} y2={26} fill="#e6f5ec" fillOpacity={0.55} ifOverflow="hidden" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 10]}
                tickFormatter={(v) => `+$${v}K`}
                tick={{ fontSize: 11, fill: "#9b99a2" }}
                tickLine={false}
                axisLine={{ stroke: "#e6e2da" }}
                label={{ value: "Added monthly AI spend", position: "insideBottom", offset: -14, fontSize: 11, fill: "#6c6a74" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 26]}
                tickFormatter={(v) => `+${v}%`}
                tick={{ fontSize: 11, fill: "#9b99a2" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Output change", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#6c6a74" }}
              />
              <ZAxis range={[140, 140]} />
              <ReferenceLine y={0} stroke="#e6e2da" />
              <Tooltip
                cursor={false}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Pt;
                  return (
                    <div className="rounded-xl border border-line bg-surface p-3 text-[12.5px] shadow-pop">
                      <p className="font-semibold">{p.name}</p>
                      <p className="num mt-1 text-muted">AI spend +{money(p.x * 1000)} · output {pct(p.y / 100)}</p>
                      <p className="num text-muted">Cost / {p.unit} {pct(p.cpo)}</p>
                    </div>
                  );
                }}
              />
              <Scatter
                data={data}
                animationDuration={700}
                onClick={(p: unknown) => {
                  const d = ((p as { payload?: Pt }).payload ?? p) as Pt;
                  setAiTeam(aiTeam === d.id ? "all" : (d.id as typeof aiTeam));
                }}
                shape={(props: unknown) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: Pt };
                  const dim = aiTeam !== "all" && aiTeam !== payload.id;
                  return (
                    <g style={{ cursor: "pointer" }} opacity={dim ? 0.3 : 1}>
                      <circle cx={cx} cy={cy} r={14} fill="transparent" />
                      <circle cx={cx} cy={cy} r={7} fill={payload.color} stroke="#fff" strokeWidth={2} />
                    </g>
                  );
                }}
              >
                <LabelList
                  dataKey="name"
                  content={(props: { x?: unknown; y?: unknown; value?: unknown; index?: number }) => {
                    const d = data[props.index ?? 0];
                    const x = Number(props.x) + 7;
                    const y = Number(props.y) + 7;
                    const pos: Record<string, [number, number, "start" | "end" | "middle"]> = {
                      platform: [-12, 4, "end"],
                      product: [12, 4, "start"],
                      data: [12, 4, "start"],
                      sales: [12, 4, "start"],
                      success: [4, -12, "start"],
                      ga: [4, 20, "start"],
                    };
                    const [dx, dy, anchor] = pos[d.id] ?? [12, 4, "start"];
                    return (
                      <text x={x + dx} y={y + dy} textAnchor={anchor} fontSize={11.5} fontWeight={600} fill="#16151b">
                        {String(props.value)}
                      </text>
                    );
                  }}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="-mt-1 pl-14 text-[11px] text-pos">Shaded: spend creating clear leverage</p>
        </div>

        <div className="border-t border-line-2 px-5 pb-5 pt-4 lg:border-l lg:border-t-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-subtle">Read-out</p>
          <ul className="mt-3 space-y-3">
            {[best, weakest].map((r, i) => (
              <li key={r.team.id} className={cn("rounded-xl border p-3", i === 0 ? "border-pos/20 bg-pos-50/50" : "border-warn/20 bg-warn-50/50")}>
                <p className="text-[13px] font-semibold">{r.team.name}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
                  <div><dt className="text-muted">AI spend</dt><dd className="num font-semibold">+{money(r.aiDelta, { compact: true })}</dd></div>
                  <div><dt className="text-muted">Output</dt><dd className="num font-semibold">{pct(r.team.trend.output)}</dd></div>
                  <div><dt className="text-muted">Cost/{r.team.outputUnit}</dt><dd><Delta value={r.costPerOutputChange} goodWhen="down" className="text-[12px]" /></dd></div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
            Platform and Product are converting AI spend into output. Data&apos;s spend grew {pct(weakest.aiChange)} with little change in throughput. Review use cases before raising its budget.
          </p>
        </div>
      </div>
    </Card>
  );
}

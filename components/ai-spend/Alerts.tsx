"use client";

import { ArrowRight, CircleDollarSign, Gauge, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { highSpendLowOutput, overAllowance } from "@/lib/metrics";
import { unusedSeats } from "@/data/aiSpend";
import { useApp } from "@/lib/store";
import { teamById } from "@/data/teams";
import { money } from "@/lib/utils";

export function Alerts() {
  const { openModal, aiTeam } = useApp();
  const inScope = <T extends { team: string }>(xs: T[]) => (aiTeam === "all" ? xs : xs.filter((x) => x.team === aiTeam));
  const over = inScope(overAllowance);
  const hslo = inScope(highSpendLowOutput);
  const unused = aiTeam === "all" ? unusedSeats : unusedSeats.filter((s) => s.team === teamById[aiTeam].short);

  const items = [
    { icon: CircleDollarSign, tone: "text-risk bg-risk-50", n: over.length, label: over.length === 1 ? "user over individual allowance" : "users over individual allowance", sub: over.slice(0, 2).map((w) => `${w.name} ${money(w.aiSpend)}`).join(" · ") || "None in scope" },
    { icon: Gauge, tone: "text-warn bg-warn-50", n: hslo.length, label: "high-spend / below-benchmark signals", sub: "Spend >2× team median with output below team average" },
    { icon: UserX, tone: "text-ink-2 bg-canvas-2", n: unused.length, label: unused.length === 1 ? "unused AI seat" : "unused AI seats", sub: unused.map((s) => `${s.tool} · ${s.lastActive}`).join(" · ") || "None in scope" },
  ];

  return (
    <div id="signals" className="grid scroll-mt-24 grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((it) => (
        <Card key={it.label} interactive className="flex flex-col p-4">
          <div className="flex items-center gap-3">
            <span className={`grid size-9 place-items-center rounded-xl ${it.tone}`}>
              <it.icon className="size-4" />
            </span>
            <p className="text-[14px] font-semibold leading-snug">
              <span className="num text-[20px]">{it.n}</span> {it.label}
            </p>
          </div>
          <p className="mt-2 line-clamp-2 text-[12.5px] text-muted">{it.sub}</p>
          <button onClick={() => openModal("signals")} className="mt-3 inline-flex items-center gap-1 self-start text-[13px] font-medium text-brand hover:text-brand-700">
            Review <ArrowRight className="size-3.5" />
          </button>
        </Card>
      ))}
    </div>
  );
}

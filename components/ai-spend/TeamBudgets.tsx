"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { teams } from "@/data/teams";
import { useApp } from "@/lib/store";
import { cn, money } from "@/lib/utils";

export function TeamBudgets() {
  const { aiTeam, setAiTeam } = useApp();
  return (
    <Card>
      <CardHeader title="Team budgets" description="Month to date vs monthly AI budget" />
      <ul className="mt-3 px-2 pb-3">
        {teams.map((t) => {
          const u = t.aiSpend / t.aiBudget;
          const over = u > 1;
          const active = aiTeam === t.id;
          return (
            <li key={t.id}>
              <button
                onClick={() => setAiTeam(active ? "all" : t.id)}
                aria-pressed={active}
                className={cn("w-full rounded-xl px-3 py-2.5 text-left transition-colors", active ? "bg-brand-50" : "hover:bg-canvas")}
              >
                <span className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2 rounded-full" style={{ background: t.color }} />
                    {t.name}
                  </span>
                  <span className="num text-ink-2">
                    <span className="font-medium text-ink">{money(t.aiSpend)}</span> / {money(t.aiBudget)}
                  </span>
                </span>
                <span className="mt-2 flex items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-2">
                    <span
                      className={cn("block h-full rounded-full transition-[width] duration-700", over ? "bg-risk" : u > 0.9 ? "bg-[#E3A008]" : "bg-brand")}
                      style={{ width: `${Math.min(u, 1) * 100}%` }}
                    />
                  </span>
                  <span className={cn("num flex w-16 items-center justify-end gap-1 text-[12px]", over ? "font-medium text-risk" : "text-muted")}>
                    {over && <TriangleAlert className="size-3" aria-label="Over budget" />}
                    {Math.round(u * 100)}%
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

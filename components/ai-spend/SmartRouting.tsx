"use client";

import { ArrowRight, Route } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { routedMonthly, routingSavingsQuarterly, routingSavingsMonthly } from "@/lib/aiMetrics";
import { company } from "@/lib/metrics";
import { useCountUp } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import { cn, money } from "@/lib/utils";

export function SmartRouting() {
  const { smartRouting, setSmartRouting, toast } = useApp();
  const saved = useCountUp(smartRouting ? routingSavingsQuarterly : 0, 1400, 0);
  const projected = useCountUp(smartRouting ? routedMonthly : company.ai, 1100);

  return (
    <Card className={cn("relative overflow-hidden p-5 transition-colors duration-500", smartRouting && "border-brand/30")} data-tour="smart-routing">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 transition-opacity duration-700", smartRouting && "opacity-100")} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={cn("grid size-9 place-items-center rounded-xl transition-colors", smartRouting ? "bg-brand text-white" : "bg-canvas-2 text-ink-2")}>
              <Route className="size-4.5" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                AI Smart Routing
                <Badge tone={smartRouting ? "positive" : "outline"} aria-live="polite">{smartRouting ? "ON" : "OFF"}</Badge>
              </p>
              <p className="mt-0.5 max-w-[380px] text-[13px] text-muted">
                Automatically route routine workloads to the most cost-efficient approved model.
              </p>
            </div>
          </div>
          <Switch
            checked={smartRouting}
            onCheckedChange={(v) => {
              setSmartRouting(v);
              if (v) toast("Smart Routing enabled", "Routine workloads will use the most cost-efficient approved model. Policy owners notified.");
            }}
            aria-label="Enable Smart Routing"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line-2 bg-surface/80 p-3.5">
            <p className="text-[12px] text-muted">Projected monthly AI spend</p>
            <p className="num mt-1.5 flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em]">
              {smartRouting && <span className="text-[14px] font-normal text-subtle line-through">{money(company.ai)}</span>}
              {smartRouting && <ArrowRight className="size-3.5 text-subtle" />}
              {money(projected)}
            </p>
          </div>
          <div className="rounded-xl border border-line-2 bg-surface/80 p-3.5">
            <p className="text-[12px] text-muted">Projected quarterly savings</p>
            <p className={cn("num mt-1.5 text-[20px] font-semibold tracking-[-0.02em] transition-colors", smartRouting ? "text-pos" : "text-subtle")}>
              {money(saved)}
              <span className="ml-1 text-[13px] font-normal text-muted">saved</span>
            </p>
          </div>
        </div>

        {!smartRouting ? (
          <button
            onClick={() => {
              setSmartRouting(true);
              toast("Smart Routing enabled", "Routine workloads will use the most cost-efficient approved model.");
            }}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 active:scale-[0.98]"
          >
            Enable Smart Routing
          </button>
        ) : (
          <p className="mt-4 animate-fade-up text-[13px] text-ink-2">
            Saving ~{money(routingSavingsMonthly)}/month. Complex engineering work stays on your frontier models; no team budgets changed.
          </p>
        )}
        <p className="mt-3 text-[11.5px] text-subtle">Estimated savings based on illustrative workload distribution.</p>
      </div>
    </Card>
  );
}

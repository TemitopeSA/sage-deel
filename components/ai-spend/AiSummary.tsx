"use client";

import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breakdown, InfoTip } from "@/components/ui/info-tip";
import { aiSummary, routingSavingsMonthly } from "@/lib/aiMetrics";
import { AI_DAILY_RUN_RATE, DAYS_REMAINING } from "@/data/aiSpend";
import { useCountUp } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import { money, pct } from "@/lib/utils";

export function AiSummary() {
  const { smartRouting } = useApp();
  const spend = useCountUp(aiSummary.spend, 1000, 0);
  const projected = useCountUp(smartRouting ? aiSummary.projected - routingSavingsMonthly : aiSummary.projected, 900);
  const util = aiSummary.utilization;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-1 text-[13px] font-medium text-muted">
            Monthly AI spend
            <InfoTip label="Monthly AI spend">
              <Breakdown title="AI spend, month to date" rows={[{ label: "Seat licences", value: money(aiSummary.spend * 0.58) }, { label: "Usage-based billing", value: money(aiSummary.spend * 0.42) }]} total={{ label: "Total", value: money(aiSummary.spend) }} note="Reconciles to the sum of per-worker AI spend in Deel IT. Illustrative." />
            </InfoTip>
          </p>
          <p className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em]">{money(spend)}</p>
          <p className="mt-2 text-[12.5px] text-muted">{pct(0.142, { decimals: 1 })} vs August</p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-muted">Budget</p>
          <p className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em]">{money(aiSummary.budget)}</p>
          <p className="mt-2 text-[12.5px] text-muted">Set in Workforce Planning</p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-muted">Utilization</p>
          <p className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em]">{(util * 100).toFixed(1)}%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas-2" role="progressbar" aria-valuenow={Math.round(util * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Budget utilization">
            <div className="h-full rounded-full bg-brand transition-[width] duration-700" style={{ width: `${util * 100}%` }} />
          </div>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[13px] font-medium text-muted">
            Projected month-end
            <InfoTip label="Projected month-end" align="end">
              <Breakdown title="Projection" rows={[{ label: "Month to date", value: money(aiSummary.spend) }, { label: `Run rate × ${DAYS_REMAINING} days`, value: money(AI_DAILY_RUN_RATE * DAYS_REMAINING) }]} total={{ label: "Projected", value: money(aiSummary.projected) }} note="Trailing 7-day daily run rate. Illustrative." />
            </InfoTip>
          </p>
          <p className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em]">{money(projected)}</p>
          <p className="mt-2 flex items-center gap-2 text-[12.5px] text-muted">
            {smartRouting ? (
              <Badge tone="positive"><Zap />Smart Routing on</Badge>
            ) : aiSummary.projected > aiSummary.budget * 0.98 ? (
              <span className="text-warn">{money(aiSummary.budget - aiSummary.projected)} headroom</span>
            ) : (
              <span>within budget</span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

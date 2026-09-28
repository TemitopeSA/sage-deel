"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Gauge, Globe, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Insight } from "@/data/insights";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const icons = { trending: TrendingUp, globe: Globe, sparkles: Sparkles, gauge: Gauge };
const tones = {
  positive: "bg-pos-50 text-pos",
  neutral: "bg-brand-50 text-brand",
  warning: "bg-warn-50 text-warn",
};

export function InsightCard({ insight }: { insight: Insight }) {
  const router = useRouter();
  const { setFilters, openCountry, setAiTeam } = useApp();
  const Icon = icons[insight.icon];

  const act = () => {
    const a = insight.action;
    if (a.kind === "team-economics") {
      setFilters({ team: a.team ?? "all", country: "all", workerType: "all" });
      router.push("/sage/team-economics");
    } else if (a.kind === "ai-spend") {
      setAiTeam("all");
      router.push("/sage/ai-spend#signals");
    } else if (a.kind === "country") {
      openCountry(a.country);
    }
  };

  return (
    <Card interactive className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tones[insight.tone])}>
          <Icon className="size-4" />
        </span>
        <p className="text-[14px] font-semibold leading-snug tracking-[-0.01em]">{insight.headline}</p>
      </div>
      <p className="mt-2 pl-11 text-[13px] leading-relaxed text-muted">{insight.detail}</p>
      <div className="mt-auto flex items-center justify-between pl-11 pt-4">
        <button onClick={act} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand-700">
          {insight.cta} <ArrowRight className="size-3.5" />
        </button>
        <span className="text-[11px] text-subtle">{insight.sources.join(" · ")}</span>
      </div>
    </Card>
  );
}

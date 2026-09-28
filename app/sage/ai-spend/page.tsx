"use client";

import { PageHeader, SectionTitle, DataLabel } from "@/components/dashboard/PageHeader";
import { AiSummary } from "@/components/ai-spend/AiSummary";
import { AiLeverageChart } from "@/components/charts/AiLeverageChart";
import { ToolBars } from "@/components/ai-spend/ToolBars";
import { SmartRouting } from "@/components/ai-spend/SmartRouting";
import { TeamBudgets } from "@/components/ai-spend/TeamBudgets";
import { Alerts } from "@/components/ai-spend/Alerts";
import { ProvisionCard } from "@/components/ai-spend/ProvisionCard";
import { Select } from "@/components/ui/select";
import { teams } from "@/data/teams";
import { useApp } from "@/lib/store";
import type { TeamId } from "@/types";

export default function AiSpendPage() {
  const { aiTeam, setAiTeam } = useApp();
  return (
    <>
      <PageHeader
        title="AI Spend"
        subtitle="Understand where AI spend is going — and whether it's creating leverage."
        actions={
          <Select
            label="Team"
            value={aiTeam}
            onChange={(v) => setAiTeam(v as TeamId | "all")}
            options={[{ value: "all", label: "All teams" }, ...teams.map((t) => ({ value: t.id, label: t.name }))]}
          />
        }
      />
      <AiSummary />
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <AiLeverageChart />
        <ToolBars />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SmartRouting />
        <TeamBudgets />
      </div>
      <SectionTitle aside={<DataLabel />}>Signals to review</SectionTitle>
      <Alerts />
      <div className="mt-4">
        <ProvisionCard />
      </div>
    </>
  );
}

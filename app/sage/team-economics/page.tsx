"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { FilterBar } from "@/components/team/FilterBar";
import { Connectors } from "@/components/team/Connectors";
import { TeamTable } from "@/components/team/TeamTable";
import { CostOutputScatter } from "@/components/charts/CostOutputScatter";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulatedLoad } from "@/lib/hooks";

export default function TeamEconomicsPage() {
  const loading = useSimulatedLoad(520);
  return (
    <>
      <PageHeader title="Team Economics" subtitle="Understand workforce spend alongside measurable business output." actions={null} />
      <div className="mb-4">
        <FilterBar />
      </div>
      <Connectors />
      {loading ? (
        <div className="mt-4 space-y-4" aria-busy="true" aria-label="Analyzing workforce data">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-[13px] text-muted">Analyzing workforce data…</p>
            <Skeleton className="mt-4 h-[300px] w-full" />
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 animate-fade-up">
          <CostOutputScatter />
          <TeamTable />
        </div>
      )}
    </>
  );
}

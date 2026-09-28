"use client";

import { RotateCcw } from "lucide-react";
import { Select } from "@/components/ui/select";
import { countries } from "@/data/countries";
import { teams } from "@/data/teams";
import { defaultFilters, type WorkerFilters } from "@/lib/metrics";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function FilterBar() {
  const { filters, setFilters } = useApp();
  const dirty = JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
      <Select
        label="Team"
        value={filters.team}
        onChange={(v) => setFilters({ team: v as WorkerFilters["team"] })}
        options={[
          { value: "all", label: "All teams" },
          { value: "engineering", label: "All engineering" },
          ...teams.map((t) => ({ value: t.id, label: t.name })),
        ]}
      />
      <Select
        label="Country"
        value={filters.country}
        onChange={(v) => setFilters({ country: v as WorkerFilters["country"] })}
        options={[{ value: "all", label: "All countries" }, ...countries.map((c) => ({ value: c.code, label: c.name }))]}
      />
      <Select
        label="Worker type"
        value={filters.workerType}
        onChange={(v) => setFilters({ workerType: v as WorkerFilters["workerType"] })}
        options={[
          { value: "all", label: "All" },
          { value: "EOR", label: "EOR" },
          { value: "Contractor", label: "Contractor" },
          { value: "Employee", label: "Employee" },
        ]}
      />
      <Select label="Period" value="90" onChange={() => {}} options={[{ value: "90", label: "Last 90 days" }]} />
      {dirty && (
        <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)}>
          <RotateCcw className="!size-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countryRow, company, countryRow as cr } from "@/lib/metrics";
import { money } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { CountryCode } from "./CountryEconomics";

export function CountryDetail() {
  const { country, openCountry, setFilters, runAdvisor } = useApp();
  const router = useRouter();
  if (!country) return null;
  const r = countryRow(country);
  const us = cr("US");
  const c = r.components;
  const composition = [
    { label: "Base compensation", v: c.base },
    { label: "Employer taxes", v: c.taxes },
    { label: "Benefits", v: c.benefits },
    { label: "Platform fees", v: c.fees },
    { label: "Equipment & software", v: c.equipment + c.software },
    { label: "AI tools", v: c.ai },
  ];
  const maxTeam = Math.max(...r.teams.map((t) => t.count));
  const engDelta = r.engineering.headcount && country !== "US" ? 1 - r.engineering.avgCost / us.engineering.avgCost : null;

  return (
    <Dialog open={!!country} onOpenChange={(o) => !o && openCountry(null)}>
      <DialogContent
        className="max-w-[720px]"
        title={
          <span className="flex items-center gap-2.5">
            <CountryCode code={r.country.code} />
            {r.country.name}
          </span>
        }
        description={`${r.headcount} workers · ${((r.cost / company.cost) * 100).toFixed(1)}% of workforce cost · ${r.country.timezone}`}
      >
        <div className="grid grid-cols-4 gap-px border-b border-line-2 bg-line-2">
          {[
            { l: "Monthly cost", v: money(r.cost, { compact: true }) },
            { l: "Avg cost / worker", v: money(r.avgCost, { compact: true }) },
            { l: "Output index", v: r.output.toFixed(0) },
            { l: "Cost / output pt", v: money(r.costPerOutput) },
          ].map((k) => (
            <div key={k.l} className="bg-surface px-6 py-4">
              <p className="text-[12px] text-muted">{k.l}</p>
              <p className="num mt-1 text-[20px] font-semibold tracking-[-0.02em]">{k.v}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 px-6 py-5">
          <div>
            <p className="text-[13px] font-semibold">Headcount by team</p>
            <ul className="mt-3 space-y-2">
              {r.teams.map(({ team, count }) => (
                <li key={team.id} className="flex items-center gap-3 text-[13px]">
                  <span className="w-[130px] truncate text-ink-2">{team.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-2">
                    <span className="block h-full rounded-full" style={{ width: `${(count / maxTeam) * 100}%`, background: team.color }} />
                  </span>
                  <span className="num w-5 text-right font-medium">{count}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <Badge tone="brand">{r.types.EOR} EOR</Badge>
              <Badge tone="sun">{r.types.Contractor} Contractor</Badge>
              {r.types.Employee > 0 && <Badge>{r.types.Employee} Employee</Badge>}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold">Where the money goes</p>
            <dl className="mt-3 space-y-2 text-[13px]">
              {composition.map((row) => (
                <div key={row.label} className="flex justify-between">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="num font-medium">{money(row.v, { compact: true })}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {engDelta !== null && (
          <div className="mx-6 mb-5 rounded-xl bg-brand-50 px-4 py-3 text-[13px] text-brand-700">
            <span className="font-semibold">{r.engineering.headcount} engineers</span> here cost{" "}
            <span className="font-semibold">{Math.round(engDelta * 100)}% less</span> fully loaded than your US engineering cohort, at an Output Index of{" "}
            {r.engineering.output.toFixed(0)} vs {us.engineering.output.toFixed(0)}.
          </div>
        )}

        <div className="flex items-center justify-between border-t border-line-2 px-6 py-4">
          <p className="text-[12px] text-subtle">Illustrative data. Market assumptions are not legal or tax guidance.</p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setFilters({ country, team: "all", workerType: "all" });
                openCountry(null);
                router.push("/sage/team-economics");
              }}
            >
              View workers
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                openCountry(null);
                runAdvisor(country === "PL" || country === "BR" ? "compare" : "hire10");
                router.push("/sage/hiring-advisor");
              }}
            >
              Model hiring here <ArrowRight />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

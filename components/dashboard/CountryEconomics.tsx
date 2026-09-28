"use client";

import { ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { DataLabel } from "./PageHeader";
import { byCountry, company } from "@/lib/metrics";
import { money } from "@/lib/utils";
import { useApp } from "@/lib/store";

export function CountryCode({ code }: { code: string }) {
  return (
    <span className="grid h-5 w-7 shrink-0 place-items-center rounded-[5px] border border-line bg-canvas text-[10px] font-semibold tracking-wide text-ink-2">
      {code}
    </span>
  );
}

export function CountryEconomics() {
  const { openCountry } = useApp();
  const rows = [...byCountry].sort((a, b) => b.cost - a.cost);
  const maxShare = Math.max(...rows.map((r) => r.cost / company.cost));

  return (
    <Card data-tour="country-economics">
      <CardHeader
        title="Country economics"
        description="Fully loaded monthly cost and output across your 8 markets. Select a country for detail."
        action={<DataLabel />}
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-[13px]">
          <caption className="sr-only">Workforce cost and output by country</caption>
          <thead>
            <tr className="border-y border-line-2 bg-[#fbfaf7] text-left text-[12px] text-muted">
              <th scope="col" className="py-2.5 pl-5 font-medium">Country</th>
              <th scope="col" className="py-2.5 text-right font-medium">Headcount</th>
              <th scope="col" className="py-2.5 pl-8 font-medium">Monthly cost · share</th>
              <th scope="col" className="py-2.5 text-right font-medium">Avg cost / worker</th>
              <th scope="col" className="py-2.5 text-right font-medium">
                <span className="inline-flex items-center gap-1">
                  Output index
                  <InfoTip label="Output index" align="end">
                    <p className="font-semibold text-ink">Output Index</p>
                    <p className="mt-1.5">
                      An illustrative composite of connected activity signals (e.g. PRs merged, tickets resolved, pipeline generated), normalized 0–100 within each function.
                    </p>
                    <p className="mt-2 text-[12px] text-subtle">Used for workforce planning and trend analysis. Not an employee performance score.</p>
                  </InfoTip>
                </span>
              </th>
              <th scope="col" className="py-2.5 text-right font-medium">Cost / output pt</th>
              <th scope="col" className="py-2.5 pl-6 pr-5 font-medium">Mix</th>
              <th scope="col" className="w-8"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const share = r.cost / company.cost;
              return (
                <tr
                  key={r.country.code}
                  onClick={() => openCountry(r.country.code)}
                  className="group cursor-pointer border-b border-line-2 transition-colors last:border-0 hover:bg-canvas/60"
                >
                  <td className="py-3 pl-5">
                    <button
                      onClick={(e) => { e.stopPropagation(); openCountry(r.country.code); }}
                      className="flex items-center gap-2.5 font-medium text-ink"
                    >
                      <CountryCode code={r.country.code} />
                      {r.country.name}
                    </button>
                  </td>
                  <td className="num py-3 text-right text-ink-2">{r.headcount}</td>
                  <td className="py-3 pl-8">
                    <div className="flex items-center gap-3">
                      <span className="num w-[72px] font-medium text-ink">{money(r.cost, { compact: true })}</span>
                      <span className="h-1.5 w-[120px] overflow-hidden rounded-full bg-canvas-2" aria-hidden>
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${(share / maxShare) * 100}%` }}
                        />
                      </span>
                      <span className="num w-10 text-[12px] text-muted">{(share * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="num py-3 text-right text-ink-2">{money(r.avgCost, { compact: true })}</td>
                  <td className="num py-3 text-right font-medium">{r.output.toFixed(0)}</td>
                  <td className="num py-3 text-right text-ink-2">{money(r.costPerOutput)}</td>
                  <td className="py-3 pl-6 pr-5">
                    <span className="flex h-1.5 w-24 overflow-hidden rounded-full bg-canvas-2" aria-label={`${r.types.EOR} EOR, ${r.types.Contractor} contractors, ${r.types.Employee} employees`}>
                      <span className="bg-brand" style={{ width: `${(r.types.EOR / r.headcount) * 100}%` }} />
                      <span className="ml-px bg-sun" style={{ width: `${(r.types.Contractor / r.headcount) * 100}%` }} />
                      <span className="ml-px bg-ink" style={{ width: `${(r.types.Employee / r.headcount) * 100}%` }} />
                    </span>
                  </td>
                  <td className="pr-4 text-subtle">
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-line-2 px-5 py-3 text-[12px] text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-brand" />EOR</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-sun" />Contractor</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-ink" />Employee</span>
        <span className="ml-auto">Cost / output pt = avg fully loaded monthly cost ÷ avg Output Index</span>
      </div>
    </Card>
  );
}

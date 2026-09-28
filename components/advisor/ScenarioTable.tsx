import { Badge } from "@/components/ui/badge";
import { CountryCode } from "@/components/dashboard/CountryEconomics";
import { countryByCode } from "@/data/countries";
import type { HiringOption } from "@/types";
import { cn, money, pct } from "@/lib/utils";

const levelTone = (v: string, invert = false) => {
  const good = invert ? v === "Low" : v === "High";
  const bad = invert ? v === "High" : v === "Low";
  return good ? "positive" : bad ? "risk" : "warning";
};

export function ScenarioTable({ options, recommendedId }: { options: HiringOption[]; recommendedId?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[760px] text-[13px]">
        <caption className="sr-only">Hiring scenarios compared</caption>
        <thead>
          <tr className="border-b border-line-2 bg-[#fbfaf7] text-left text-[11.5px] text-muted">
            <th scope="col" className="py-2.5 pl-4 font-medium">Market</th>
            <th scope="col" className="py-2.5 font-medium">Model</th>
            <th scope="col" className="py-2.5 text-right font-medium">10-hire annual cost</th>
            <th scope="col" className="py-2.5 pl-5 font-medium">Time to hire</th>
            <th scope="col" className="py-2.5 font-medium">Talent</th>
            <th scope="col" className="py-2.5 font-medium">Compliance</th>
            <th scope="col" className="py-2.5 text-right font-medium">Exp. output</th>
            <th scope="col" className="py-2.5 pr-4 text-right font-medium">vs US benchmark</th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => {
            const rec = o.id === recommendedId;
            return (
              <tr key={o.id} className={cn("border-b border-line-2 last:border-0", rec && "bg-brand-50/70")}>
                <td className="py-3 pl-4">
                  <span className="flex items-center gap-2 font-medium">
                    <CountryCode code={o.country} />
                    {countryByCode[o.country].name}
                    {rec && <Badge tone="brand">Best fit</Badge>}
                  </span>
                </td>
                <td className="py-3">
                  <Badge tone={o.model === "EOR" ? "brand" : o.model === "Contractor" ? "sun" : "neutral"}>{o.model}</Badge>
                </td>
                <td className="num py-3 text-right font-semibold">{money(o.annualCost, { compact: true })}</td>
                <td className="num py-3 pl-5 text-ink-2">{o.timeToHire}</td>
                <td className="py-3"><Badge tone={levelTone(o.talentAvailability)}>{o.talentAvailability}</Badge></td>
                <td className="py-3"><Badge tone={levelTone(o.complianceComplexity, true)}>{o.complianceComplexity}</Badge></td>
                <td className="num py-3 text-right font-medium">{o.expectedOutput}</td>
                <td className="num py-3 pr-4 text-right font-semibold text-pos">{pct(o.deltaVsBenchmark)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breakdown } from "@/components/ui/info-tip";
import { PageHeader, SectionTitle, DataLabel } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MainInsight } from "@/components/dashboard/MainInsight";
import { CountryEconomics } from "@/components/dashboard/CountryEconomics";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { SageMark } from "@/components/layout/SageMark";
import { insights } from "@/data/insights";
import { company, PREV_MONTH_AI, PREV_MONTH_TOTAL_COST } from "@/lib/metrics";
import { useSimulatedLoad } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import { money } from "@/lib/utils";

export default function OverviewPage() {
  const loading = useSimulatedLoad();
  const { openModal } = useApp();
  const router = useRouter();
  const c = company.components;
  const per = (n: number) => money(n / company.headcount);

  return (
    <>
      <PageHeader
        title="Workforce Intelligence"
        subtitle="See what your workforce costs, what it's producing, and where your next dollar should go."
        actions={
          <>
            <Button onClick={() => openModal("export", "overview")}>
              <Download /> Export report
            </Button>
            <Button variant="primary" onClick={() => router.push("/sage/hiring-advisor")}>
              <SageMark className="!size-4 text-white" /> Ask Deel AI
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          tourId="kpi-total"
          loading={loading}
          label="Total monthly workforce cost"
          value={company.cost}
          format={(n) => money(n, { compact: true })}
          delta={{ value: company.cost / PREV_MONTH_TOTAL_COST - 1, goodWhen: "down", suffix: "vs August" }}
          info={
            <Breakdown
              title="Total monthly workforce cost"
              rows={[
                { label: "Base compensation", value: money(c.base) },
                { label: "Employer taxes", value: money(c.taxes) },
                { label: "Benefits", value: money(c.benefits) },
                { label: "Platform fees", value: money(c.fees) },
                { label: "Equipment", value: money(c.equipment) },
                { label: "Software", value: money(c.software) },
                { label: "AI tools", value: money(c.ai) },
              ]}
              total={{ label: "Total", value: money(company.cost) }}
              note="Sum of all 180 workers from Deel Payroll, EOR and Contractor records. August included quarterly sales commissions. Illustrative calculation."
            />
          }
        />
        <KpiCard
          loading={loading}
          label="Fully loaded cost / worker"
          value={company.avgCost}
          format={(n) => money(n)}
          footnote={<span>per month, all worker types</span>}
          info={
            <Breakdown
              title="Fully loaded cost per worker"
              rows={[
                { label: "Base compensation", value: per(c.base) },
                { label: "Employer taxes", value: per(c.taxes) },
                { label: "Benefits", value: per(c.benefits) },
                { label: "Platform fees", value: per(c.fees) },
                { label: "Equipment", value: per(c.equipment) },
                { label: "Software", value: per(c.software) },
                { label: "AI spend", value: per(c.ai) },
              ]}
              total={{ label: "Per worker / month", value: money(company.avgCost) }}
            />
          }
        />
        <KpiCard
          loading={loading}
          label="AI spend this month"
          value={company.ai}
          format={(n) => money(n)}
          delta={{ value: company.ai / PREV_MONTH_AI - 1, goodWhen: "neutral", suffix: "vs August" }}
          info={
            <Breakdown
              title="AI spend"
              rows={[{ label: "Tool billing (5 vendors)", value: money(company.ai) }, { label: "Share of workforce cost", value: `${((company.ai / company.cost) * 100).toFixed(1)}%` }]}
              note="Seat and usage billing mapped to workers via Deel IT. Illustrative."
            />
          }
        />
        <KpiCard
          loading={loading}
          label="Headcount"
          value={company.headcount}
          format={(n) => Math.round(n).toString()}
          footnote={<span>across 8 countries · 60% EOR</span>}
        />
      </div>

      <div className="mt-4">
        <MainInsight />
      </div>

      <SectionTitle aside={<DataLabel />}>Signals worth your attention</SectionTitle>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {insights.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </div>

      <div className="mt-8">
        <CountryEconomics />
      </div>
    </>
  );
}

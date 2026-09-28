import { Card, CardHeader } from "@/components/ui/card";
import { aiTools } from "@/data/aiSpend";
import { money } from "@/lib/utils";

export function ToolBars() {
  const max = Math.max(...aiTools.map((t) => t.spend));
  const total = aiTools.reduce((s, t) => s + t.spend, 0);
  return (
    <Card className="flex flex-col">
      <CardHeader title="Spend by tool" description={`${aiTools.reduce((s, t) => s + t.seats, 0)} seats across 5 vendors`} />
      <ul className="mt-4 flex-1 space-y-3.5 px-5 pb-5">
        {aiTools.map((t) => (
          <li key={t.name}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="font-medium">{t.name}</span>
              <span className="num">
                <span className="font-semibold">{money(t.spend)}</span>
                <span className="ml-1.5 text-[12px] text-muted">{Math.round((t.spend / total) * 100)}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas-2">
              <div className="h-full origin-left animate-[grow_0.8s_cubic-bezier(0.2,0.7,0.2,1)_both] rounded-full" style={{ width: `${(t.spend / max) * 100}%`, background: t.color }} />
            </div>
            <p className="mt-1 text-[11.5px] text-subtle">{t.seats} seats · {money(t.spend / t.seats)}/seat</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

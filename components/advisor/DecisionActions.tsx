"use client";

import { ArrowRight, Briefcase, CalendarRange, FileSpreadsheet, Scale } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DecisionActions() {
  const { openModal } = useApp();
  const actions = [
    { id: "hire", icon: Briefcase, label: "Open roles in Deel Hire", tag: "Deel Hire", primary: true, run: () => openModal("hire") },
    { id: "compare", icon: Scale, label: "Compare employee vs contractor", tag: "EOR · Contractor", run: () => openModal("compare") },
    { id: "export", icon: FileSpreadsheet, label: "Export to Finance", tag: "Finance", run: () => openModal("export", "hiring") },
    { id: "plan", icon: CalendarRange, label: "Create workforce plan", tag: "Workforce Planning", run: () => openModal("plan") },
  ];
  return (
    <div data-tour="decision-actions">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">Act on it in Deel</p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={a.run}
            className={cn(
              "group flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]",
              a.primary ? "border-brand bg-brand text-white shadow-[0_6px_16px_-6px_rgb(75_60_240/0.5)] hover:bg-brand-600" : "border-line bg-surface hover:border-[#d9d4ca] hover:shadow-lift",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <a.icon className={cn("size-4", a.primary ? "text-white" : "text-brand")} />
              <ArrowRight className={cn("size-3.5 opacity-0 transition-opacity group-hover:opacity-100", a.primary ? "text-white" : "text-muted")} />
            </span>
            <span className="mt-2.5 text-[13px] font-medium leading-snug">{a.label}</span>
            <span className={cn("mt-0.5 text-[11px]", a.primary ? "text-white/70" : "text-subtle")}>{a.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

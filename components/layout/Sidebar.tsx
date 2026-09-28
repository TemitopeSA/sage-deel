"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Blocks,
  Briefcase,
  ChartColumn,
  ChartGantt,
  ChevronsUpDown,
  CircleHelp,
  Heart,
  House,
  Landmark,
  Laptop,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { SageMark } from "./SageMark";

const coreNav = [
  { label: "Home", icon: House },
  { label: "People", icon: Users },
  { label: "Recruitment", icon: Briefcase },
  { label: "Payroll", icon: Banknote },
  { label: "Finance", icon: Landmark },
  { label: "Engage", icon: Heart },
  { label: "Planning", icon: ChartGantt },
  { label: "IT", icon: Laptop },
  { label: "Analytics", icon: ChartColumn },
];

const sageNav = [
  { label: "Overview", href: "/sage" },
  { label: "Team economics", href: "/sage/team-economics" },
  { label: "AI spend", href: "/sage/ai-spend" },
  { label: "Hiring advisor", href: "/sage/hiring-advisor" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toast } = useApp();
  const inSage = pathname.startsWith("/sage");

  const outside = (label: string) =>
    toast(`${label} lives in Deel`, "This concept prototype only covers the Sage layer. Other areas are shown for context.");

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center px-5">
        <span className="text-[26px] font-bold leading-none tracking-[-0.04em] text-ink" aria-label="deel.">
          deel<span className="text-brand">.</span>
        </span>
      </div>

      <button
        onClick={() => toast("Northwind Labs", "Company switching is outside this concept.")}
        className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:bg-canvas"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-ink text-[13px] font-semibold text-white">N</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">Northwind Labs</span>
          <span className="block text-[12px] text-muted">180 workers</span>
        </span>
        <ChevronsUpDown className="size-4 text-subtle" />
      </button>

      <nav aria-label="Primary" className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-3">
        <ul className="space-y-0.5">
          {coreNav.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button
                onClick={() => outside(label)}
                className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
              >
                <Icon className="size-[18px] text-muted" strokeWidth={1.75} />
                {label}
              </button>
            </li>
          ))}

          <li className="pt-0.5" data-tour="nav-sage">
            <Link
              href="/sage"
              aria-current={pathname === "/sage" ? "page" : undefined}
              className={cn(
                "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors",
                inSage ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-2 hover:bg-canvas hover:text-ink",
              )}
            >
              <SageMark className="size-[18px]" />
              Sage
              <span className="ml-auto rounded-md bg-sun px-1.5 py-px text-[10px] font-semibold tracking-wide text-ink">NEW</span>
            </Link>
            {inSage && (
              <ul className="relative mb-1 ml-[21px] mt-1 space-y-0.5 border-l border-line pl-3">
                {sageNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex h-8 items-center rounded-lg px-2.5 text-[13px] transition-colors",
                          active ? "font-medium text-ink" : "text-muted hover:bg-canvas hover:text-ink",
                        )}
                      >
                        {active && <span className="absolute -left-[13px] top-1.5 h-5 w-[2px] rounded-full bg-brand" />}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {[
            { label: "Apps & Automation", icon: Blocks },
            { label: "Settings", icon: Settings },
          ].map(({ label, icon: Icon }) => (
            <li key={label}>
              <button
                onClick={() => outside(label)}
                className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
              >
                <Icon className="size-[18px] text-muted" strokeWidth={1.75} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={() => outside("Help Center")}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] text-ink-2 transition-colors hover:bg-canvas"
        >
          <CircleHelp className="size-[18px] text-muted" strokeWidth={1.75} />
          Help
        </button>
        <div className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-[12px] font-semibold text-brand-700">T</span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium">Temitope</span>
            <span className="block text-[12px] text-muted">VP Finance</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

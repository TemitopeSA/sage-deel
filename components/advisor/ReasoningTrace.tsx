"use client";

import { Check, LoaderCircle } from "lucide-react";
import type { Stage } from "@/data/advisorScript";
import { cn } from "@/lib/utils";

export function ReasoningTrace({ stages, current, done }: { stages: Stage[]; current: number; done: boolean }) {
  return (
    <ol className="relative space-y-0" aria-label="Reasoning steps">
      {stages.map((s, i) => {
        const state = done || i < current ? "done" : i === current ? "active" : "pending";
        return (
          <li key={s.label} className="relative flex gap-3 pb-3 last:pb-0">
            {i < stages.length - 1 && (
              <span
                aria-hidden
                className={cn("absolute left-[9px] top-5 h-[calc(100%-12px)] w-px transition-colors duration-500", state === "done" ? "bg-brand/40" : "bg-line")}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full border transition-all duration-300",
                state === "done" && "border-brand bg-brand text-white",
                state === "active" && "border-brand bg-surface text-brand",
                state === "pending" && "border-line bg-surface text-transparent",
              )}
            >
              {state === "done" ? <Check className="size-3" strokeWidth={3} /> : state === "active" ? <LoaderCircle className="size-3 animate-spin" /> : null}
            </span>
            <div className={cn("min-w-0 transition-opacity duration-300", state === "pending" && "opacity-40")}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">{s.label}</p>
              <p className="text-[12.5px] text-muted">{s.detail}</p>
            </div>
            <span className="sr-only">{state === "done" ? "complete" : state === "active" ? "in progress" : "pending"}</span>
          </li>
        );
      })}
    </ol>
  );
}

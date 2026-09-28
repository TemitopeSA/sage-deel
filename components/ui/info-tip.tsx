"use client";
import * as Popover from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Explainability affordance: click the (i) to see how a metric is built. */
export function InfoTip({
  label,
  children,
  className,
  align = "start",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`How is ${label} calculated?`}
        className={cn("inline-flex rounded-full p-0.5 text-subtle transition-colors hover:text-ink data-[state=open]:text-brand", className)}
      >
        <Info className="size-3.5" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={8}
          className="z-50 w-80 rounded-xl border border-line bg-surface p-4 text-[13px] text-ink-2 shadow-pop outline-none data-[state=open]:animate-scale-in"
        >
          {children}
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function Breakdown({
  title,
  rows,
  total,
  note = "Illustrative calculation.",
}: {
  title: string;
  rows: { label: string; value: string }[];
  total?: { label: string; value: string };
  note?: string;
}) {
  return (
    <div>
      <p className="font-semibold text-ink">{title}</p>
      <dl className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4">
            <dt className="text-muted">{r.label}</dt>
            <dd className="num font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
      {total && (
        <div className="mt-2.5 flex justify-between border-t border-line-2 pt-2.5 font-semibold text-ink">
          <span>{total.label}</span>
          <span className="num">{total.value}</span>
        </div>
      )}
      <p className="mt-3 text-[12px] text-subtle">{note}</p>
    </div>
  );
}

"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/lib/hooks";
import { cn, pct } from "@/lib/utils";

export function Delta({
  value,
  goodWhen,
  suffix,
  className,
}: {
  value: number;
  goodWhen: "up" | "down" | "neutral";
  suffix?: string;
  className?: string;
}) {
  const up = value > 0;
  const good = goodWhen === "neutral" ? null : goodWhen === "up" ? up : !up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-0.5 text-[12.5px] font-medium",
        good === null ? "text-ink-2" : good ? "text-pos" : "text-risk",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{up ? "up" : "down"}</span>
      {pct(Math.abs(value), { decimals: 1, signed: false })}
      {suffix && <span className="font-normal text-muted">&nbsp;{suffix}</span>}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  format,
  delta,
  footnote,
  info,
  loading,
  tourId,
  children,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: { value: number; goodWhen: "up" | "down" | "neutral"; suffix?: string };
  footnote?: React.ReactNode;
  info?: React.ReactNode;
  loading?: boolean;
  tourId?: string;
  children?: React.ReactNode;
}) {
  const animated = useCountUp(loading ? 0 : value, 1000, 0);
  return (
    <Card className="relative flex flex-col p-5" data-tour={tourId}>
      <div className="flex items-center gap-1 text-[13px] font-medium text-muted">
        {label}
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </div>
      {loading ? (
        <>
          <Skeleton className="mt-3 h-8 w-32" />
          <Skeleton className="mt-3 h-4 w-40" />
        </>
      ) : (
        <>
          <p className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] text-ink" aria-live="off">
            {format(animated)}
          </p>
          <div className="mt-3 flex min-h-5 items-center gap-2 text-[12.5px] text-muted">
            {delta && <Delta {...delta} />}
            {footnote}
          </div>
        </>
      )}
      {children}
    </Card>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-canvas-2 text-ink-2",
        brand: "bg-brand-50 text-brand-700",
        positive: "bg-pos-50 text-pos",
        warning: "bg-warn-50 text-warn",
        risk: "bg-risk-50 text-risk",
        sun: "bg-sun-50 text-sun-700",
        outline: "border border-line text-muted bg-surface",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

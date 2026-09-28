import { SageMark } from "@/components/layout/SageMark";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = "Sage",
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div className="min-w-0">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-brand">
          <SageMark className="size-3.5" />
          {eyebrow}
          <span className="text-subtle">· Workforce intelligence</span>
        </p>
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink">{title}</h1>
        <p className="mt-1 text-[14px] text-muted">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-4">
      <h2 className="text-[18px] font-semibold tracking-[-0.015em]">{children}</h2>
      {aside}
    </div>
  );
}

export function DataLabel({ children = "Illustrative data" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-line px-1.5 py-0.5 text-[11px] text-subtle">
      {children}
    </span>
  );
}

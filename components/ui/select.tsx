import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface pl-3 pr-8 text-[13px] shadow-card transition-colors focus-within:border-brand hover:border-[#d9d4ca]",
        className,
      )}
    >
      <span className="text-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent font-medium text-ink outline-none"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 size-3.5 text-muted" />
    </label>
  );
}

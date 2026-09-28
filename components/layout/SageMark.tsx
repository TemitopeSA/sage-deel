import { cn } from "@/lib/utils";

/** Sage glyph: a leaf-like spark — two arcs meeting at a point, reading as "insight". */
export function SageMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <path
        d="M10 2.5c0 4.1 3.4 7.5 7.5 7.5-4.1 0-7.5 3.4-7.5 7.5 0-4.1-3.4-7.5-7.5-7.5 4.1 0 7.5-3.4 7.5-7.5Z"
        fill="currentColor"
      />
      <circle cx="16" cy="4" r="1.6" fill="#FFD74A" />
    </svg>
  );
}

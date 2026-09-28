"use client";

import { CircleCheck, X } from "lucide-react";
import { useApp } from "@/lib/store";

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-[360px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-pos" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[12.5px] text-muted">{t.body}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="rounded p-0.5 text-subtle hover:text-ink">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

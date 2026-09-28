"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SageMark } from "@/components/layout/SageMark";
import { useApp } from "@/lib/store";

export function WelcomePanel() {
  const { welcomeOpen, setWelcomeOpen, startTour, startDemo, tourStep, demoActive } = useApp();
  const open = welcomeOpen && tourStep === null && !demoActive;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setWelcomeOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgb(22_21_27/0.3)] backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-line bg-surface shadow-pop outline-none data-[state=open]:animate-scale-in">
          <div className="relative overflow-hidden px-8 pb-7 pt-8">
            <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-50" />
            <div aria-hidden className="absolute right-10 top-10 size-5 rounded-full bg-sun" />
            <div className="relative">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand text-white shadow-[0_8px_20px_-8px_rgb(75_60_240/0.6)]">
                <SageMark className="size-5" />
              </span>
              <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-brand">Sage · Workforce Intelligence</p>
              <DialogPrimitive.Title className="mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.025em]">
                Turn your workforce data into better decisions.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2.5 text-[14px] leading-relaxed text-muted">
                A concept prototype exploring what Deel could unlock by connecting workforce cost, output, AI spend, and global hiring decisions.
              </DialogPrimitive.Description>
            </div>
          </div>
          <div className="space-y-2 px-8 pb-7">
            <Button variant="primary" size="lg" className="w-full" onClick={startTour} autoFocus>
              Take the 2-minute tour <ArrowRight />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button size="lg" onClick={() => setWelcomeOpen(false)}>Explore myself</Button>
              <Button size="lg" onClick={startDemo}>
                <Play className="!size-3.5 fill-current" /> Executive demo
              </Button>
            </div>
          </div>
          <p className="border-t border-line-2 bg-[#fbfaf7] px-8 py-3 text-[11.5px] text-subtle">
            Independent concept with fictional data — not affiliated with Deel.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

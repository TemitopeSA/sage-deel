"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SageMark } from "@/components/layout/SageMark";
import { useApp } from "@/lib/store";
import { defaultFilters } from "@/lib/metrics";
import { placeCard, SpotlightMask, useTargetRect } from "./Spotlight";

type App = ReturnType<typeof useApp>;

interface Step {
  route: string;
  selector: string | null;
  title: string;
  body: string;
  before?: (app: App) => void;
}

const steps: Step[] = [
  {
    route: "/sage",
    selector: '[data-tour="kpi-total"]',
    title: "This is your workforce economic picture.",
    body: "Fully loaded cost for all 180 workers, built from the Payroll, EOR and Contractor records Deel already holds. Click any (i) to see how a number is built.",
  },
  {
    route: "/sage",
    selector: '[data-tour="country-economics"]',
    title: "See where your workforce spend is concentrated.",
    body: "Cost, output and worker mix across 8 markets. Select a country to see its detail and model hiring there.",
  },
  {
    route: "/sage/team-economics",
    selector: '[data-tour="scatter"]',
    title: "Move from cost to output.",
    body: "Each dot is one worker: fully loaded cost against an illustrative Output Index from connected tools. It's for planning signals, not performance ratings. Click a dot.",
    before: (app) => app.setFilters(defaultFilters),
  },
  {
    route: "/sage/ai-spend",
    selector: '[data-tour="ai-vs-output"]',
    title: "Identify teams where AI is changing productivity economics.",
    body: "Added AI spend against output change. Platform and Product turn it into leverage; Data doesn't yet.",
  },
  {
    route: "/sage/ai-spend",
    selector: '[data-tour="smart-routing"]',
    title: "Control AI spend without slowing teams down.",
    body: "Route routine workloads to cheaper approved models. Try the toggle.",
  },
  {
    route: "/sage/hiring-advisor",
    selector: '[data-tour="advisor-prompt"]',
    title: "Now ask the decision that matters.",
    body: "Hiring Advisor is a decision agent grounded in your own workforce economics, not a generic chatbot.",
    before: (app) => app.resetAdvisor(),
  },
  {
    route: "/sage/hiring-advisor",
    selector: '[data-tour="recommendation"]',
    title: "Compare countries and employment models using the economics of your existing workforce.",
    body: "The recommendation explains what, why and the impact, citing your in-market cohorts rather than generic salary tables.",
    before: (app) => app.runAdvisor("hire10", { instant: true }),
  },
  {
    route: "/sage/hiring-advisor",
    selector: '[data-tour="decision-actions"]',
    title: "Take action directly in Deel.",
    body: "Open roles in Deel Hire, choose EOR or Contractor, send the scenario to Finance or Workforce Planning. Insight turns into product usage.",
  },
  {
    route: "/sage/hiring-advisor",
    selector: null,
    title: "That's the idea.",
    body: "Turn Deel from the system that records workforce decisions into the system that helps companies make them.",
  },
];

export function Tour() {
  const app = useApp();
  const { tourStep, setTourStep } = app;
  const router = useRouter();
  const pathname = usePathname();
  const step = tourStep !== null ? steps[tourStep] : null;
  const rect = useTargetRect(step && pathname === step.route ? step.selector : null, `${tourStep}-${pathname}`);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 380, h: 220 });

  // Navigate and prepare state for each step.
  React.useEffect(() => {
    if (!step) return;
    step.before?.(app);
    if (pathname !== step.route) router.push(step.route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep]);

  React.useLayoutEffect(() => {
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      if (Math.abs(r.height - size.h) > 2) setSize({ w: r.width, h: r.height });
    }
  }, [tourStep, size.h]);

  React.useEffect(() => {
    if (tourStep === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTourStep(null);
      if (e.key === "ArrowRight") setTourStep(Math.min(steps.length - 1, tourStep + 1));
      if (e.key === "ArrowLeft") setTourStep(Math.max(0, tourStep - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourStep, setTourStep]);

  if (tourStep === null || !step) return null;

  const last = tourStep === steps.length - 1;
  const pos = placeCard(rect, size.w, size.h);

  if (last) {
    return (
      <>
        <SpotlightMask rect={null} dim={0.6} />
        <div role="dialog" aria-modal="true" aria-labelledby="tour-title" className="fixed left-1/2 top-1/2 z-[90] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-7 text-center shadow-pop animate-scale-in">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand text-white"><SageMark className="size-6" /></span>
          <h2 id="tour-title" className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">{step.title}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-[12px] font-medium text-ink-2">
            {["Data", "Insight", "Recommendation", "Action"].map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <ArrowRight className="size-3 text-subtle" />}
                <span className="rounded-md bg-canvas px-2 py-1">{s}</span>
              </React.Fragment>
            ))}
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            autoFocus
            onClick={() => {
              setTourStep(null);
              router.push("/sage");
            }}
          >
            Explore Workforce Intelligence
          </Button>
          <button onClick={() => setTourStep(tourStep - 1)} className="mt-3 text-[12.5px] text-muted hover:text-ink">Back</button>
        </div>
      </>
    );
  }

  return (
    <>
      <SpotlightMask rect={rect} />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-step-title"
        className="fixed z-[90] w-[380px] rounded-2xl bg-surface p-5 shadow-pop transition-[top,left,opacity] duration-300 ease-out"
        style={pos ? { top: pos.top, left: pos.left, opacity: 1 } : { top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: rect ? 1 : 0.95 }}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-brand">
            <SageMark className="size-3.5" /> Concept tour
          </p>
          <p className="num text-[12px] text-muted">{tourStep + 1} / {steps.length - 1}</p>
        </div>
        <h2 id="tour-step-title" className="mt-2.5 text-[16px] font-semibold leading-snug tracking-[-0.01em]">{step.title}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{step.body}</p>
        <div className="mt-4 flex gap-1" aria-hidden>
          {steps.slice(0, -1).map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= tourStep ? "bg-brand" : "bg-canvas-2"}`} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setTourStep(null)} className="text-[13px] text-muted hover:text-ink">Skip tour</button>
          <div className="flex gap-2">
            {tourStep > 0 && (
              <Button size="sm" onClick={() => setTourStep(tourStep - 1)} aria-label="Back">
                <ArrowLeft className="!size-3.5" /> Back
              </Button>
            )}
            <Button size="sm" variant="primary" autoFocus onClick={() => setTourStep(tourStep + 1)}>
              Next <ArrowRight className="!size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

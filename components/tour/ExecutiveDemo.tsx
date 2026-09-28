"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { SageMark } from "@/components/layout/SageMark";
import { useApp } from "@/lib/store";
import { defaultFilters } from "@/lib/metrics";
import { findWorker } from "@/data/workers";
import { SpotlightMask, useTargetRect } from "./Spotlight";
import { cn } from "@/lib/utils";

type App = ReturnType<typeof useApp>;

interface Beat {
  chapter: string;
  route: string;
  selector: string | null;
  caption: string;
  ms: number;
  enter?: (app: App) => void;
  later?: { at: number; run: (app: App) => void };
  endCard?: boolean;
}

const chinedu = findWorker("Chinedu Okafor");

// Scripted for a sub-2-minute Loom: Overview 0:00 → Team 0:25 → AI 0:43 → Hiring 1:02 → Action 1:27.
const beats: Beat[] = [
  {
    chapter: "Intro",
    route: "/sage",
    selector: null,
    ms: 8000,
    caption: "Deel already sits on one of the richest sources of global workforce cost data. The opportunity is to connect that data to output and turn it into decisions.",
    enter: (a) => {
      a.openWorker(null);
      a.openModal(null);
      a.setSmartRouting(false);
      a.resetAdvisor();
      a.setFilters(defaultFilters);
    },
    endCard: true,
  },
  { chapter: "Overview", route: "/sage", selector: '[data-tour="kpi-total"]', ms: 9000, caption: "First, I can see the true economic picture of my workforce: fully loaded, across every country and worker type." },
  { chapter: "Overview", route: "/sage", selector: '[data-tour="main-insight"]', ms: 8000, caption: "Engineering output is growing faster than engineering cost, and AI is part of the reason." },
  { chapter: "Team economics", route: "/sage/team-economics", selector: '[data-tour="scatter"]', ms: 9000, caption: "But cost alone isn't enough. I want to know what I'm getting for that spend." },
  {
    chapter: "Team economics",
    route: "/sage/team-economics",
    selector: null,
    ms: 9000,
    caption: "Every point is explainable: cost breakdown, cohort benchmark and clear guardrails. It's a planning signal, not a performance score.",
    enter: (a) => a.openWorker(chinedu.id),
  },
  {
    chapter: "AI spend",
    route: "/sage/ai-spend",
    selector: '[data-tour="ai-vs-output"]',
    ms: 10000,
    caption: "And as AI becomes another workforce cost layer, I need to know whether that spend is actually creating leverage.",
    enter: (a) => a.openWorker(null),
  },
  {
    chapter: "AI spend",
    route: "/sage/ai-spend",
    selector: '[data-tour="smart-routing"]',
    ms: 9000,
    caption: "Smart Routing keeps the same teams and tools, and saves about $41K a quarter.",
    later: { at: 1800, run: (a) => a.setSmartRouting(true) },
  },
  {
    chapter: "Hiring advisor",
    route: "/sage/hiring-advisor",
    selector: '[data-tour="advisor-trace"]',
    ms: 13000,
    caption: "Then I can ask the question CFOs and operators ultimately care about: where should I hire next?",
    enter: (a) => a.runAdvisor("hire10"),
  },
  {
    chapter: "Hiring advisor",
    route: "/sage/hiring-advisor",
    selector: '[data-tour="recommendation"]',
    ms: 11000,
    caption: "It compares my existing workforce economics, modeled country costs, employment models and output signals.",
  },
  {
    chapter: "Action",
    route: "/sage/hiring-advisor",
    selector: '[data-tour="decision-actions"]',
    ms: 10000,
    caption: "And the recommendation doesn't stop at insight. It flows into the actions Deel already owns: Hire. EOR. Contractor. IT. Payroll.",
    later: { at: 3500, run: (a) => a.openModal("hire") },
  },
  {
    chapter: "Close",
    route: "/sage/hiring-advisor",
    selector: null,
    ms: 9000,
    caption: "That's the opportunity: turn Deel from the system that records workforce decisions into the system that helps companies make them.",
    enter: (a) => a.openModal(null),
    endCard: true,
  },
];

const total = beats.reduce((s, b) => s + b.ms, 0);
const starts = beats.map((_, i) => beats.slice(0, i).reduce((s, b) => s + b.ms, 0));
const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export function ExecutiveDemo() {
  const app = useApp();
  const { demoActive, stopDemo } = app;
  const router = useRouter();
  const pathname = usePathname();
  const [i, setI] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const appRef = React.useRef(app);
  React.useEffect(() => {
    appRef.current = app;
  });

  const beat = demoActive ? beats[i] : null;
  const rect = useTargetRect(beat && pathname === beat.route ? beat.selector : null, `${i}-${pathname}`);

  React.useEffect(() => {
    if (!demoActive) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setI(0);
    setElapsed(0);
    setPaused(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [demoActive]);

  // Enter each beat: navigate, run its action, schedule delayed action.
  React.useEffect(() => {
    if (!demoActive) return;
    const b = beats[i];
    b.enter?.(appRef.current);
    if (pathname !== b.route) router.push(b.route);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsed(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActive, i]);

  // Clock: advances beats and fires delayed actions from the interval callback.
  const iRef = React.useRef(0);
  const elapsedRef = React.useRef(0);
  React.useEffect(() => {
    iRef.current = i;
    elapsedRef.current = 0;
  }, [i]);

  React.useEffect(() => {
    if (!demoActive || paused) return;
    const id = window.setInterval(() => {
      const b = beats[iRef.current];
      const next = elapsedRef.current + 100;
      elapsedRef.current = next;
      if (b.later && next >= b.later.at && next < b.later.at + 100) b.later.run(appRef.current);
      if (next >= b.ms) {
        if (iRef.current < beats.length - 1) setI(iRef.current + 1);
        else setPaused(true);
      } else {
        setElapsed(next);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [demoActive, paused]);

  React.useEffect(() => {
    if (!demoActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopDemo();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key === "ArrowRight") setI((x) => Math.min(beats.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demoActive, stopDemo]);

  if (!demoActive || !beat) return null;

  const overall = starts[i] + Math.min(elapsed, beat.ms);
  const modalOpen = app.modal !== null || app.workerId !== null;
  const chapters = beats.map((b, idx) => ({ b, idx })).filter(({ b, idx }) => idx === 0 || beats[idx - 1].chapter !== b.chapter);

  return (
    <>
      {beat.endCard ? (
        <div className="fixed inset-0 z-[85] grid place-items-center bg-[rgb(18_17_24/0.82)] backdrop-blur-sm animate-fade-in">
          <div className="max-w-[760px] px-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand text-white"><SageMark className="size-7" /></span>
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-200">
              {i === 0 ? "Sage · Workforce Intelligence for Deel" : "Sage"}
            </p>
            <p key={i} className="mt-3 animate-fade-up text-[30px] font-semibold leading-[1.25] tracking-[-0.025em] text-white">
              {beat.caption}
            </p>
            <p className="mt-6 text-[12px] text-white/50">Independent concept prototype · fictional data · not affiliated with Deel</p>
          </div>
        </div>
      ) : (
        !modalOpen && <SpotlightMask rect={rect} dim={0.42} />
      )}

      <div className="fixed bottom-5 left-1/2 z-[95] w-[min(880px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl bg-ink text-white shadow-pop" role="region" aria-label="Executive demo controls">
        {!beat.endCard && (
          <p key={i} className="animate-fade-up px-5 pt-4 text-[16px] font-medium leading-snug" aria-live="polite">
            {beat.caption}
          </p>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-brand-200">
            <span className="size-1.5 animate-pulse rounded-full bg-risk" /> Demo
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setI(Math.max(0, i - 1))} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Previous">
              <SkipBack className="size-3.5" />
            </button>
            <button onClick={() => setPaused((p) => !p)} className="rounded-md p-1.5 text-white hover:bg-white/10" aria-label={paused ? "Play" : "Pause"}>
              {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
            </button>
            <button onClick={() => setI(Math.min(beats.length - 1, i + 1))} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Next">
              <SkipForward className="size-3.5" />
            </button>
          </div>
          <div className="relative flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear" style={{ width: `${(overall / total) * 100}%` }} />
            </div>
            <div className="mt-1.5 flex">
              {chapters.map(({ b, idx }) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  className={cn("truncate text-left text-[10.5px] transition-colors hover:text-white", beats[i].chapter === b.chapter ? "text-white" : "text-white/45")}
                  style={{ width: `${(beats.filter((x) => x.chapter === b.chapter).reduce((s, x) => s + x.ms, 0) / total) * 100}%` }}
                >
                  {b.chapter}
                </button>
              ))}
            </div>
          </div>
          <span className="num w-[76px] text-right text-[12px] text-white/60">{fmt(overall)} / {fmt(total)}</span>
          <button onClick={stopDemo} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Exit demo">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

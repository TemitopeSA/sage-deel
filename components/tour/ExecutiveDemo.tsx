"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { SageMark } from "@/components/layout/SageMark";
import { useApp } from "@/lib/store";
import { defaultFilters } from "@/lib/metrics";
import { findWorker } from "@/data/workers";
import script from "@/data/demoScript.json";
import voice from "@/data/voiceManifest.json";
import { track } from "@/lib/analytics";
import { SpotlightMask, useTargetRect } from "./Spotlight";
import { cn } from "@/lib/utils";

type App = ReturnType<typeof useApp>;
type ScriptId = (typeof script)[number]["id"];

interface Stage {
  route: string;
  selector: string | null;
  /** Puts the app in the right state for this beat, so skipping back and forth stays consistent. */
  enter?: (app: App) => void;
  later?: { at: number; run: (app: App) => void };
  endCard?: boolean;
}

interface Beat extends Stage {
  id: string;
  chapter: string;
  caption: string;
  ms: number;
  clipMs: number;
}

const chinedu = findWorker("Chinedu Okafor");
const clean = (a: App) => {
  a.openWorker(null);
  a.openModal(null);
};
const ensureAdvice = (a: App) => {
  if (a.advisor.scenario !== "hire10" || a.advisor.status === "idle") a.runAdvisor("hire10", { instant: true });
};

const stages: Record<ScriptId, Stage> = {
  intro: {
    route: "/sage",
    selector: null,
    endCard: true,
    enter: (a) => {
      clean(a);
      a.setSmartRouting(false);
      a.resetAdvisor();
      a.setFilters(defaultFilters);
    },
  },
  overview: { route: "/sage", selector: '[data-tour="kpi-total"]', enter: clean },
  insight: { route: "/sage", selector: '[data-tour="main-insight"]', enter: clean },
  team: {
    route: "/sage/team-economics",
    selector: '[data-tour="scatter"]',
    enter: (a) => {
      clean(a);
      a.setFilters(defaultFilters);
    },
  },
  worker: {
    route: "/sage/team-economics",
    selector: null,
    enter: (a) => {
      a.openModal(null);
      a.openWorker(chinedu.id);
    },
  },
  ai: {
    route: "/sage/ai-spend",
    selector: '[data-tour="ai-vs-output"]',
    enter: (a) => {
      clean(a);
      a.setAiTeam("all");
      a.setSmartRouting(false);
    },
  },
  routing: {
    route: "/sage/ai-spend",
    selector: '[data-tour="smart-routing"]',
    enter: (a) => {
      clean(a);
      a.setSmartRouting(false);
    },
    later: { at: 1800, run: (a) => a.setSmartRouting(true) },
  },
  ask: {
    route: "/sage/hiring-advisor",
    selector: '[data-tour="advisor-trace"]',
    enter: (a) => {
      clean(a);
      a.runAdvisor("hire10");
    },
  },
  recommendation: {
    route: "/sage/hiring-advisor",
    selector: '[data-tour="recommendation"]',
    enter: (a) => {
      clean(a);
      ensureAdvice(a);
    },
  },
  action: {
    route: "/sage/hiring-advisor",
    selector: '[data-tour="decision-actions"]',
    enter: (a) => {
      clean(a);
      ensureAdvice(a);
    },
    later: { at: 4200, run: (a) => a.openModal("hire") },
  },
  close: { route: "/sage/hiring-advisor", selector: null, endCard: true, enter: clean },
};

const clips = voice.clips as Record<string, number>;
// Each beat lasts at least its scripted minimum, and always long enough for its narration.
const beats: Beat[] = script.map((s) => ({
  ...stages[s.id as ScriptId],
  id: s.id,
  chapter: s.chapter,
  caption: s.caption,
  clipMs: clips[s.id] ?? 0,
  ms: Math.max(s.minMs, (clips[s.id] ?? 0) + 1300),
}));

const total = beats.reduce((s, b) => s + b.ms, 0);
const starts = beats.map((_, i) => beats.slice(0, i).reduce((s, b) => s + b.ms, 0));
const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
const VOICE_KEY = "sage.demoVoice";

export function ExecutiveDemo() {
  const app = useApp();
  const { demoActive, stopDemo } = app;
  const router = useRouter();
  const pathname = usePathname();
  const [i, setI] = React.useState(0);
  const [run, setRun] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [voiceOn, setVoiceOn] = React.useState(true);

  const appRef = React.useRef(app);
  const iRef = React.useRef(0);
  const elapsedRef = React.useRef(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const voiceRef = React.useRef(true);
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    appRef.current = app;
  });

  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(VOICE_KEY) !== "0";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceOn(v);
      voiceRef.current = v;
    } catch {
      /* storage unavailable */
    }
  }, []);

  const beat = demoActive ? beats[i] : null;
  const rect = useTargetRect(beat && pathname === beat.route ? beat.selector : null, `${i}-${run}-${pathname}`);

  const audio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  };

  /** Plays the current beat's clip; seeks only when an offset is given (beat start, unmute). */
  const playClip = React.useCallback((offsetMs?: number) => {
    const a = audioRef.current;
    const b = beats[iRef.current];
    if (!a || !voiceRef.current || pausedRef.current) return;
    if (offsetMs !== undefined) {
      if (offsetMs >= b.clipMs) return;
      a.currentTime = offsetMs / 1000;
    } else if (a.ended) {
      return;
    }
    a.play().catch(() => {
      /* autoplay blocked; captions still carry the story */
    });
  }, []);

  const restart = React.useCallback(() => {
    setFinished(false);
    setPaused(false);
    pausedRef.current = false;
    setI(0);
    setRun((r) => r + 1);
  }, []);

  // Start / stop.
  React.useEffect(() => {
    if (!demoActive) {
      // Reset while hidden so the next start enters beat 0 exactly once.
      audioRef.current?.pause();
      /* eslint-disable react-hooks/set-state-in-effect */
      setI(0);
      setFinished(false);
      setPaused(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    track("demo_started");
  }, [demoActive]);

  // Enter each beat: set state, navigate, start narration.
  React.useEffect(() => {
    if (!demoActive) return;
    const b = beats[i];
    iRef.current = i;
    elapsedRef.current = 0;
    b.enter?.(appRef.current);
    if (pathname !== b.route) router.push(b.route);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsed(0);
    const a = audio();
    a.pause();
    a.src = `/voice/${b.id}.m4a`;
    playClip(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActive, i, run]);

  // Pause / resume narration with the demo.
  React.useEffect(() => {
    pausedRef.current = paused;
    if (paused) audioRef.current?.pause();
    else if (demoActive) playClip();
  }, [paused, demoActive, playClip]);

  // Clock: advances beats and fires delayed actions from the interval callback.
  React.useEffect(() => {
    if (!demoActive || paused) return;
    const id = window.setInterval(() => {
      const b = beats[iRef.current];
      const next = elapsedRef.current + 100;
      elapsedRef.current = next;
      if (b.later && next >= b.later.at && next < b.later.at + 100) b.later.run(appRef.current);
      if (next >= b.ms) {
        if (iRef.current < beats.length - 1) {
          setI(iRef.current + 1);
        } else {
          setElapsed(b.ms);
          setPaused(true);
          setFinished(true);
          track("demo_completed");
        }
      } else {
        setElapsed(next);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [demoActive, paused]);

  const goTo = React.useCallback((idx: number) => {
    setFinished(false);
    if (idx === iRef.current) setRun((r) => r + 1);
    else setI(idx);
  }, []);

  const togglePlay = React.useCallback(() => {
    if (finished) restart();
    else setPaused((p) => !p);
  }, [finished, restart]);

  const toggleVoice = () => {
    const v = !voiceOn;
    setVoiceOn(v);
    voiceRef.current = v;
    try {
      window.localStorage.setItem(VOICE_KEY, v ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
    if (v) playClip(elapsedRef.current);
    else audioRef.current?.pause();
  };

  const exit = React.useCallback(() => {
    audioRef.current?.pause();
    stopDemo();
  }, [stopDemo]);

  React.useEffect(() => {
    if (!demoActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight") goTo(Math.min(beats.length - 1, iRef.current + 1));
      if (e.key === "ArrowLeft") goTo(Math.max(0, iRef.current - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demoActive, exit, togglePlay, goTo]);

  React.useEffect(() => () => audioRef.current?.pause(), []);

  if (!demoActive || !beat) return null;

  const overall = starts[i] + Math.min(elapsed, beat.ms);
  const modalOpen = app.modal !== null || app.workerId !== null;
  const chapters = beats.map((b, idx) => ({ b, idx })).filter(({ b, idx }) => idx === 0 || beats[idx - 1].chapter !== b.chapter);
  const iconBtn = "rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white";

  return (
    <>
      {beat.endCard ? (
        <div className="fixed inset-0 z-[85] grid place-items-center bg-[rgb(18_17_24/0.82)] backdrop-blur-sm animate-fade-in">
          <div className="max-w-[760px] px-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand text-white"><SageMark className="size-7" /></span>
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-200">
              {i === 0 ? "Sage · Workforce Intelligence for Deel" : "Sage"}
            </p>
            <p key={`${i}-${run}`} className="mt-3 animate-fade-up text-[30px] font-semibold leading-[1.25] tracking-[-0.025em] text-white">
              {beat.caption}
            </p>
            {finished ? (
              <div className="mt-8 flex animate-fade-up justify-center gap-2">
                <button onClick={restart} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-[13.5px] font-medium text-ink hover:bg-white/90">
                  <RotateCcw className="size-4" /> Replay demo
                </button>
                <button onClick={exit} className="inline-flex h-10 items-center rounded-lg border border-white/25 px-4 text-[13.5px] font-medium text-white hover:bg-white/10">
                  Explore Sage
                </button>
              </div>
            ) : (
              <p className="mt-6 text-[12px] text-white/50">Independent concept prototype · fictional data · not affiliated with Deel</p>
            )}
          </div>
        </div>
      ) : (
        !modalOpen && <SpotlightMask rect={rect} dim={0.42} />
      )}

      <div className="fixed bottom-5 left-1/2 z-[95] w-[min(880px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl bg-ink text-white shadow-pop" role="region" aria-label="Executive demo controls">
        {!beat.endCard && (
          <p key={`${i}-${run}`} className="animate-fade-up px-5 pt-4 text-[16px] font-medium leading-snug" aria-live="polite">
            {beat.caption}
          </p>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-brand-200">
            <span className={cn("size-1.5 rounded-full", paused ? "bg-white/40" : "animate-pulse bg-risk")} /> Demo
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => goTo(Math.max(0, i - 1))} className={iconBtn} aria-label="Previous">
              <SkipBack className="size-3.5" />
            </button>
            <button
              onClick={togglePlay}
              className="rounded-md p-1.5 text-white hover:bg-white/10"
              aria-label={finished ? "Replay demo" : paused ? "Play" : "Pause"}
              title={finished ? "Replay" : paused ? "Play" : "Pause"}
            >
              {finished ? <RotateCcw className="size-4" /> : paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
            </button>
            <button onClick={() => goTo(Math.min(beats.length - 1, i + 1))} className={iconBtn} aria-label="Next">
              <SkipForward className="size-3.5" />
            </button>
            <button onClick={toggleVoice} className={iconBtn} aria-label={voiceOn ? "Mute narration" : "Unmute narration"} aria-pressed={voiceOn} title={voiceOn ? "Mute narration" : "Unmute narration"}>
              {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
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
                  onClick={() => goTo(idx)}
                  className={cn("truncate text-left text-[10.5px] transition-colors hover:text-white", beats[i].chapter === b.chapter ? "text-white" : "text-white/45")}
                  style={{ width: `${(beats.filter((x) => x.chapter === b.chapter).reduce((s, x) => s + x.ms, 0) / total) * 100}%` }}
                >
                  {b.chapter}
                </button>
              ))}
            </div>
          </div>
          <span className="num w-[76px] text-right text-[12px] text-white/60">{fmt(overall)} / {fmt(total)}</span>
          <button onClick={exit} className={iconBtn} aria-label="Exit demo">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

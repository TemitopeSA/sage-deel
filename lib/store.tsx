"use client";

import * as React from "react";
import type { CountryCode, TeamId } from "@/types";
import { defaultFilters, type WorkerFilters } from "@/lib/metrics";

export type ModalId =
  | "hire"
  | "export"
  | "plan"
  | "compare"
  | "provision"
  | "concept"
  | "signals"
  | null;

export type ScenarioId = "hire10" | "compare" | "model" | "reduce";

export const scenarioQueries: Record<ScenarioId, string> = {
  hire10: "I need 10 more backend engineers. Where should I hire them?",
  compare: "Compare hiring in Poland vs Brazil.",
  model: "Should I hire these roles as employees or contractors?",
  reduce: "Where can I reduce workforce cost without reducing capacity?",
};

/** Number of reasoning stages the advisor walks through before answering. */
export const ADVISOR_STAGES = 7;
const STAGE_MS = 820;

interface AdvisorState {
  status: "idle" | "thinking" | "done";
  scenario: ScenarioId | null;
  query: string;
  stage: number;
}

interface Toast {
  id: number;
  title: string;
  body?: string;
}

interface State {
  filters: WorkerFilters;
  setFilters: (f: Partial<WorkerFilters>) => void;
  aiTeam: TeamId | "all";
  setAiTeam: (t: TeamId | "all") => void;

  smartRouting: boolean;
  setSmartRouting: (v: boolean) => void;

  workerId: string | null;
  openWorker: (id: string | null) => void;
  country: CountryCode | null;
  openCountry: (c: CountryCode | null) => void;

  modal: ModalId;
  exportContext: "overview" | "hiring";
  openModal: (m: ModalId, ctx?: "overview" | "hiring") => void;

  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;

  welcomeOpen: boolean;
  setWelcomeOpen: (v: boolean) => void;

  tourStep: number | null;
  startTour: () => void;
  setTourStep: (n: number | null) => void;

  demoActive: boolean;
  startDemo: () => void;
  stopDemo: () => void;

  advisor: AdvisorState;
  runAdvisor: (scenario: ScenarioId, opts?: { instant?: boolean; query?: string }) => void;
  resetAdvisor: () => void;

  toasts: Toast[];
  toast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
}

const Ctx = React.createContext<State | null>(null);

const ls = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, v: string) {
    try {
      window.localStorage.setItem(key, v);
    } catch {
      /* storage unavailable */
    }
  },
};

export const STORAGE = {
  welcome: "sage.welcomeSeen",
  tourDone: "sage.tourCompleted",
  routing: "sage.smartRouting",
  demo: "sage.demoMode",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = React.useState<WorkerFilters>(defaultFilters);
  const [aiTeam, setAiTeam] = React.useState<TeamId | "all">("all");
  const [smartRouting, setSmartRoutingState] = React.useState(false);
  const [workerId, setWorkerId] = React.useState<string | null>(null);
  const [country, setCountry] = React.useState<CountryCode | null>(null);
  const [modal, setModal] = React.useState<ModalId>(null);
  const [exportContext, setExportContext] = React.useState<"overview" | "hiring">("overview");
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [welcomeOpen, setWelcomeOpenState] = React.useState(false);
  const [tourStep, setTourStep] = React.useState<number | null>(null);
  const [demoActive, setDemoActive] = React.useState(false);
  const [advisor, setAdvisor] = React.useState<AdvisorState>({
    status: "idle",
    scenario: null,
    query: "",
    stage: 0,
  });
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // Hydrate persisted preferences after mount (keeps SSR markup deterministic).
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSmartRoutingState(ls.get(STORAGE.routing) === "1");
    if (!ls.get(STORAGE.welcome)) setWelcomeOpenState(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Advance the advisor's reasoning stages on a timer; lives here so it survives navigation.
  React.useEffect(() => {
    if (advisor.status !== "thinking") return;
    const t = window.setTimeout(() => {
      setAdvisor((a) =>
        a.stage + 1 >= ADVISOR_STAGES ? { ...a, stage: ADVISOR_STAGES, status: "done" } : { ...a, stage: a.stage + 1 },
      );
    }, STAGE_MS);
    return () => window.clearTimeout(t);
  }, [advisor.status, advisor.stage]);

  const toast = React.useCallback((title: string, body?: string) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, title, body }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  }, []);

  const value: State = {
    filters,
    setFilters: (f) => setFiltersState((prev) => ({ ...prev, ...f })),
    aiTeam,
    setAiTeam,
    smartRouting,
    setSmartRouting: (v) => {
      setSmartRoutingState(v);
      ls.set(STORAGE.routing, v ? "1" : "0");
    },
    workerId,
    openWorker: setWorkerId,
    country,
    openCountry: setCountry,
    modal,
    exportContext,
    openModal: (m, ctx) => {
      if (ctx) setExportContext(ctx);
      setModal(m);
    },
    paletteOpen,
    setPaletteOpen,
    welcomeOpen,
    setWelcomeOpen: (v) => {
      setWelcomeOpenState(v);
      if (!v) ls.set(STORAGE.welcome, "1");
    },
    tourStep,
    startTour: () => {
      setDemoActive(false);
      setWelcomeOpenState(false);
      ls.set(STORAGE.welcome, "1");
      setTourStep(0);
    },
    setTourStep: (n) => {
      if (n === null) ls.set(STORAGE.tourDone, "1");
      setTourStep(n);
    },
    demoActive,
    startDemo: () => {
      setTourStep(null);
      setWelcomeOpenState(false);
      ls.set(STORAGE.welcome, "1");
      ls.set(STORAGE.demo, "1");
      setDemoActive(true);
    },
    stopDemo: () => {
      ls.set(STORAGE.demo, "0");
      setDemoActive(false);
    },
    advisor,
    runAdvisor: (scenario, opts) =>
      setAdvisor({
        scenario,
        query: opts?.query ?? scenarioQueries[scenario],
        status: opts?.instant ? "done" : "thinking",
        stage: opts?.instant ? ADVISOR_STAGES : 0,
      }),
    resetAdvisor: () => setAdvisor({ status: "idle", scenario: null, query: "", stage: 0 }),
    toasts,
    toast,
    dismissToast: (id) => setToasts((ts) => ts.filter((t) => t.id !== id)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

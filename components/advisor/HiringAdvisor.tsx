"use client";

import * as React from "react";
import { ArrowUp, ChevronDown, Database, RotateCcw, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SageMark } from "@/components/layout/SageMark";
import { ReasoningTrace } from "./ReasoningTrace";
import { CompareResponse, HireResponse, ModelResponse, ReduceResponse } from "./Responses";
import { matchScenario, stagesFor, statusFor } from "@/data/advisorScript";
import { ADVISOR_STAGES, scenarioQueries, useApp, type ScenarioId } from "@/lib/store";
import { company, engineering } from "@/lib/metrics";
import { money } from "@/lib/utils";
import { cn } from "@/lib/utils";

const prompts: { id: ScenarioId; hint: string }[] = [
  { id: "hire10", hint: "Market, model and cost for a new team" },
  { id: "compare", hint: "Side-by-side market economics" },
  { id: "model", hint: "EOR vs contractor for full-time roles" },
  { id: "reduce", hint: "Savings that keep headcount flat" },
];

function Composer({ onSubmit, placeholder, autoFocus }: { onSubmit: (q: string) => void; placeholder: string; autoFocus?: boolean }) {
  const [q, setQ] = React.useState("");
  const submit = () => {
    const v = q.trim();
    if (!v) return;
    onSubmit(v);
    setQ("");
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 pl-4 shadow-card transition-colors focus-within:border-brand/50 focus-within:shadow-[0_0_0_4px_rgb(75_60_240/0.08)]"
    >
      <label htmlFor="advisor-input" className="sr-only">Ask about a workforce decision</label>
      <textarea
        id="advisor-input"
        rows={1}
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-[14px] outline-none placeholder:text-subtle"
      />
      <Button type="submit" variant="primary" size="icon" aria-label="Send" disabled={!q.trim()}>
        <ArrowUp />
      </Button>
    </form>
  );
}

function ContextRail() {
  return (
    <aside className="hidden space-y-4 xl:block" aria-label="Context">
      <Card className="p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold"><Database className="size-4 text-brand" />Grounded in your data</p>
        <dl className="mt-3 space-y-2 text-[12.5px]">
          {[
            ["Workers", company.headcount],
            ["Engineers", engineering.headcount],
            ["Countries", 8],
            ["Monthly workforce cost", money(company.cost, { compact: true })],
            ["Window", "Last 90 days"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-muted">{k}</dt>
              <dd className="num font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex flex-wrap gap-1 border-t border-line-2 pt-3">
          {["Deel HRIS", "Payroll", "EOR", "Deel IT", "GitHub", "Jira", "Salesforce"].map((s) => (
            <span key={s} className="rounded-md bg-canvas px-1.5 py-0.5 text-[11px] text-ink-2">{s}</span>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-[13px] font-semibold">How Sage decides</p>
        <ol className="mt-2 space-y-1 text-[12.5px] text-muted">
          <li>1. Your cost and output by market</li>
          <li>2. Modeled cost per employment model</li>
          <li>3. Compliance, talent and speed</li>
          <li>4. A recommendation you can act on</li>
        </ol>
      </Card>
      <p className="flex items-start gap-1.5 px-1 text-[11.5px] text-subtle">
        <ShieldCheck className="mt-px size-3.5 shrink-0" />
        Deterministic concept demo. No external AI calls; responses are scripted from the fictional dataset.
      </p>
    </aside>
  );
}

export function HiringAdvisor() {
  const { advisor, runAdvisor, resetAdvisor } = useApp();
  const [traceOpen, setTraceOpen] = React.useState(false);
  const [animate, setAnimate] = React.useState(advisor.status === "thinking");
  const endRef = React.useRef<HTMLDivElement>(null);
  const answerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Only type out the answer when the user watched the analysis run live.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (advisor.status === "thinking") setAnimate(true);
  }, [advisor.status]);

  React.useEffect(() => {
    if (advisor.status === "thinking") endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    // When the answer lands, bring its start (not its end) into view so the comparison is read first.
    if (advisor.status === "done") answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [advisor.status, advisor.stage]);

  const ask = (q: string) => runAdvisor(matchScenario(q), { query: q });

  if (advisor.status === "idle" || !advisor.scenario) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <Card className="p-8 animate-fade-up" data-tour="advisor-prompt">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand text-white shadow-[0_8px_20px_-8px_rgb(75_60_240/0.6)]">
            <SageMark className="size-5" />
          </span>
          <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">What workforce decision are you trying to make?</h2>
          <p className="mt-1 text-[14px] text-muted">Sage reasons over your cost, output and market data, then hands off to Deel to act.</p>
          <div className="mt-6 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => runAdvisor(p.id)}
                className="group rounded-xl border border-line bg-surface p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift active:scale-[0.99]"
              >
                <span className="block text-[14px] font-medium text-ink group-hover:text-brand-700">&ldquo;{scenarioQueries[p.id]}&rdquo;</span>
                <span className="mt-1 block text-[12.5px] text-muted">{p.hint}</span>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Composer onSubmit={ask} placeholder="Ask about hiring, markets, employment models or cost…" />
          </div>
        </Card>
        <ContextRail />
      </div>
    );
  }

  const stages = stagesFor[advisor.scenario];
  const done = advisor.status === "done";
  const Response = { hire10: HireResponse, compare: CompareResponse, model: ModelResponse, reduce: ReduceResponse }[advisor.scenario];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-5">
        <div className="flex justify-end">
          <div className="max-w-[560px] animate-fade-up rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[14px] text-white">{advisor.query}</div>
        </div>

        <div className="flex gap-3">
          <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <SageMark className="size-4" />
          </span>
          <div className="min-w-0 flex-1 space-y-4">
            <Card className="p-4" data-tour="advisor-trace">
              {done ? (
                <button onClick={() => setTraceOpen((o) => !o)} className="flex w-full items-center justify-between text-left" aria-expanded={traceOpen}>
                  <span className="text-[13px] text-muted">
                    <span className="font-medium text-ink">Reasoned through {ADVISOR_STAGES} steps</span> · workforce data → cost → output → markets → model → scenario → recommendation
                  </span>
                  <ChevronDown className={cn("size-4 text-muted transition-transform", traceOpen && "rotate-180")} />
                </button>
              ) : (
                <p className="flex items-center gap-2 text-[13.5px] font-medium text-brand-700" aria-live="polite">
                  <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-brand" /></span>
                  {statusFor(advisor.stage)}
                </p>
              )}
              {(!done || traceOpen) && (
                <div className="mt-4 animate-fade-in">
                  <ReasoningTrace stages={stages} current={advisor.stage} done={done} />
                </div>
              )}
            </Card>

            {done && (
              <div ref={answerRef} className="scroll-mt-40 animate-fade-up">
                <Response animate={animate} />
              </div>
            )}
          </div>
        </div>

        {done && (
          <div className="flex items-center gap-2 pl-11">
            <div className="flex-1">
              <Composer onSubmit={ask} placeholder="Ask a follow-up…" />
            </div>
            <Button variant="ghost" onClick={resetAdvisor}>
              <RotateCcw /> New question
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <ContextRail />
    </div>
  );
}

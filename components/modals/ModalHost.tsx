"use client";

import * as React from "react";
import { ArrowRight, Briefcase, CircleCheck, FileSpreadsheet, FileText, LoaderCircle, Laptop } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SageMark } from "@/components/layout/SageMark";
import { useApp, type ModalId } from "@/lib/store";
import { countryByCode } from "@/data/countries";
import { teamById } from "@/data/teams";
import { decisionTarget, HIRES, modelHire, usBenchmark, type DecisionTarget } from "@/data/hiringScenarios";
import { pendingProvisioning } from "@/data/aiSpend";
import { company, engineering, highSpendLowOutput, overAllowance, byTeam } from "@/lib/metrics";
import { cn, money, pct } from "@/lib/utils";

function Success({ title, body, onDone }: { title: string; body: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center animate-scale-in">
      <span className="grid size-12 place-items-center rounded-full bg-pos-50 text-pos">
        <CircleCheck className="size-6" />
      </span>
      <p className="mt-4 text-[16px] font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{body}</p>
      <Button className="mt-6" onClick={onDone}>Done</Button>
    </div>
  );
}

function useSubmit() {
  const [state, setState] = React.useState<"idle" | "working" | "done">("idle");
  const run = (ms = 900) => {
    setState("working");
    window.setTimeout(() => setState("done"), ms);
  };
  return { state, run };
}

function Footer({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line-2 px-6 py-4">
      <p className="text-[11.5px] text-subtle">{note}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5">
    <dt className="text-[13px] text-muted">{k}</dt>
    <dd className="num text-[13.5px] font-medium">{v}</dd>
  </div>
);

// --- Deel Hire ---------------------------------------------------------------

function HireModal({ close, target }: { close: () => void; target: DecisionTarget }) {
  const { state, run } = useSubmit();
  const recommended = target;
  const c = countryByCode[recommended.country];
  if (state === "done")
    return <Success title="Concept flow — role creation would continue in Deel Hire." body={`${HIRES} Backend Engineer requisitions pre-filled for ${c.name} (${recommended.model}), with budget attached and the Hiring agent ready to draft job descriptions.`} onDone={close} />;
  return (
    <>
      <div className="px-6 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
          <Briefcase className="size-4 text-brand" />
          <p className="text-[13.5px] font-medium text-brand-700">Your hiring scenario is ready.</p>
        </div>
        <dl className="mt-4 divide-y divide-line-2">
          <Row k="Roles" v={`${HIRES} × Backend Engineer`} />
          <Row k="Location" v={c.name} />
          <Row k="Employment model" v={<Badge tone="brand">{recommended.model}</Badge>} />
          <Row k="Estimated annual budget" v={money(recommended.annualCost, { compact: true })} />
          <Row k="Hiring manager" v="Engineering Manager, Platform" />
          <Row k="Typical time to hire" v={c.timeToHire} />
        </dl>
      </div>
      <Footer note="Opens in Deel Hire. Nothing is posted until you publish.">
        <Button onClick={close}>Cancel</Button>
        <Button variant="primary" onClick={() => run()} disabled={state === "working"}>
          {state === "working" ? <LoaderCircle className="animate-spin" /> : null}
          Continue to role creation <ArrowRight />
        </Button>
      </Footer>
    </>
  );
}

// --- Compare EOR vs contractor ------------------------------------------------

function CompareModal({ close, target }: { close: () => void; target: DecisionTarget }) {
  const country = target.country;
  const e = modelHire(country, "EOR");
  const k = modelHire(country, "Contractor");
  const lines: [string, keyof typeof e.breakdown][] = [
    ["Base compensation", "base"],
    ["Employer contributions", "taxes"],
    ["Benefits", "benefits"],
    ["Platform fees", "fees"],
    ["Equipment", "equipment"],
    ["Software & AI", "software"],
  ];
  return (
    <>
      <div className="px-6 py-5">
        <table className="w-full text-[13px]">
          <caption className="sr-only">Monthly cost per hire by employment model</caption>
          <thead>
            <tr className="text-left text-[12px] text-muted">
              <th scope="col" className="pb-2 font-medium">Per hire / month</th>
              <th scope="col" className="pb-2 text-right font-medium"><Badge tone="brand">EOR</Badge></th>
              <th scope="col" className="pb-2 text-right font-medium"><Badge tone="sun">Contractor</Badge></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-2">
            {lines.map(([label, key]) => (
              <tr key={key}>
                <th scope="row" className="py-2 text-left font-normal text-muted">{label}</th>
                <td className="num py-2 text-right">{money(key === "software" ? e.breakdown.software + e.breakdown.ai : e.breakdown[key])}</td>
                <td className="num py-2 text-right">{money(key === "software" ? k.breakdown.software + k.breakdown.ai : k.breakdown[key])}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="py-2.5 text-left">Total</th>
              <td className="num py-2.5 text-right">{money(e.monthly)}</td>
              <td className="num py-2.5 text-right">{money(k.monthly)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4 rounded-xl border border-line-2 bg-[#fbfaf7] p-4 text-[13px] text-ink-2">
          <p className="font-semibold text-ink">Recommendation: EOR for these roles</p>
          <p className="mt-1">
            {1 - k.monthly / e.monthly < 0.03
              ? "Contractors cost about the same here once their rate premium is included. Full-time"
              : `Contractors are ${pct(1 - k.monthly / e.monthly, { signed: false })} cheaper per month, but full-time`}
            , long-term engineers embedded in your team are where classification risk is highest. Use contractors for scoped, project-based work.
          </p>
        </div>
      </div>
      <Footer note="Illustrative. Not legal or tax advice.">
        <Button variant="primary" onClick={close}>Got it</Button>
      </Footer>
    </>
  );
}

// --- Export ------------------------------------------------------------------

function ExportModal({ close, context, target }: { close: () => void; context: "overview" | "hiring"; target: DecisionTarget }) {
  const recommended = target;
  const modeledSavings = usBenchmark.annual - target.annualCost;
  const { state, run } = useSubmit();
  const [format, setFormat] = React.useState<"pdf" | "xlsx" | "netsuite">("pdf");
  if (state === "done")
    return <Success title={context === "hiring" ? "Scenario sent to Finance" : "Report exported"} body={context === "hiring" ? "Shared with the Finance workspace and linked to the FY27 headcount budget. Approvers will be notified in Deel." : "Workforce Intelligence report generated for September 2026."} onDone={close} />;
  return (
    <>
      <div className="px-6 py-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-subtle">Preview</p>
        <div className="mt-2 rounded-xl border border-line bg-[#fbfaf7] p-5">
          <div className="rounded-lg bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-brand"><SageMark className="size-3.5" />Sage · Northwind Labs</p>
              <p className="text-[11px] text-subtle">September 2026</p>
            </div>
            <p className="mt-3 text-[16px] font-semibold">{context === "hiring" ? `Hiring scenario: ${HIRES} Backend Engineers` : "Workforce economics summary"}</p>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-[12px]">
              {(context === "hiring"
                ? [
                    ["Market", `${countryByCode[recommended.country].name} · ${recommended.model}`],
                    ["Annual cost", money(recommended.annualCost, { compact: true })],
                    ["Savings vs US", money(modeledSavings, { compact: true })],
                  ]
                : [
                    ["Monthly cost", money(company.cost, { compact: true })],
                    ["AI spend", money(company.ai, { compact: true })],
                    ["Eng. cost/output", pct(engineering.costPerOutputChange)],
                  ]
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-subtle">{k}</dt>
                  <dd className="num mt-0.5 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 space-y-1.5">
              {[92, 78, 85, 60].map((w, i) => (
                <div key={i} className="h-1.5 rounded bg-canvas-2" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
        <fieldset className="mt-4">
          <legend className="text-[13px] font-medium">Format</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {([
              ["pdf", "PDF report", FileText],
              ["xlsx", "Spreadsheet", FileSpreadsheet],
              ["netsuite", "Send to NetSuite", ArrowRight],
            ] as const).map(([id, label, Icon]) => (
              <label key={id} className={cn("flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] transition-colors", format === id ? "border-brand bg-brand-50 text-brand-700" : "border-line hover:bg-canvas")}>
                <input type="radio" name="format" value={id} checked={format === id} onChange={() => setFormat(id)} className="sr-only" />
                <Icon className="size-4" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <Footer note="Includes methodology and data-source appendix.">
        <Button onClick={close}>Cancel</Button>
        <Button variant="primary" onClick={() => run()} disabled={state === "working"}>
          {state === "working" && <LoaderCircle className="animate-spin" />}
          {context === "hiring" ? "Send to Finance" : "Export"}
        </Button>
      </Footer>
    </>
  );
}

// --- Workforce plan ----------------------------------------------------------

function PlanModal({ close, target }: { close: () => void; target: DecisionTarget }) {
  const { state, run } = useSubmit();
  const recommended = target;
  const [name, setName] = React.useState(`Q4 backend expansion — ${target.hub || countryByCode[target.country].name}`);
  const [quarter, setQuarter] = React.useState("Q4 2026");
  if (state === "done")
    return <Success title="Scenario added to Workforce Planning" body={`"${name}" is now a draft scenario with ${HIRES} positions and a ${money(recommended.annualCost, { compact: true })} budget, ready for headcount approval.`} onDone={close} />;
  return (
    <>
      <div className="space-y-4 px-6 py-5">
        <label className="block">
          <span className="text-[13px] font-medium">Scenario name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-[14px] outline-none focus:border-brand" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[13px] font-medium">Start</span>
            <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-line bg-surface px-3 text-[14px] outline-none focus:border-brand">
              <option>Q4 2026</option>
              <option>Q1 2027</option>
            </select>
          </label>
          <div>
            <span className="text-[13px] font-medium">Owner</span>
            <p className="mt-1.5 flex h-10 items-center rounded-lg border border-line bg-canvas px-3 text-[14px] text-ink-2">Temitope (VP Finance)</p>
          </div>
        </div>
        <dl className="divide-y divide-line-2 rounded-xl border border-line-2 px-4">
          <Row k="Positions" v={`${HIRES} × Backend Engineer`} />
          <Row k="Market · model" v={`${countryByCode[recommended.country].name} · ${recommended.model}`} />
          <Row k="Annual budget" v={money(recommended.annualCost, { compact: true })} />
          <Row k="vs US benchmark plan" v={<span className="text-pos">−{money(usBenchmark.annual - recommended.annualCost, { compact: true })}</span>} />
        </dl>
      </div>
      <Footer note="Syncs to Deel Workforce Planning as a draft.">
        <Button onClick={close}>Cancel</Button>
        <Button variant="primary" onClick={() => run()} disabled={state === "working"}>
          {state === "working" && <LoaderCircle className="animate-spin" />}
          Create scenario
        </Button>
      </Footer>
    </>
  );
}

// --- Provision AI access ------------------------------------------------------

function ProvisionModal({ close }: { close: () => void }) {
  const { state, run } = useSubmit();
  const { provisionSeat, seatsProvisioned } = useApp();
  const remaining = pendingProvisioning.count - seatsProvisioned;
  const ex = pendingProvisioning.example;
  const total = ex.tools.reduce((s, t) => s + t.cost, 0);
  if (state === "done")
    return <Success title="Provisioning request created" body={`${ex.name}'s AI tools will be ready on day one (${ex.start}). ${remaining} more approved ${remaining === 1 ? "seat is" : "seats are"} queued in Deel IT.`} onDone={close} />;
  return (
    <>
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700">SC</span>
          <div>
            <p className="text-[14px] font-semibold">{ex.name}</p>
            <p className="text-[12.5px] text-muted">{ex.role} · {ex.team} · starts {ex.start}</p>
          </div>
        </div>
        <p className="mt-5 text-[13px] font-medium">Tools</p>
        <ul className="mt-2 divide-y divide-line-2 rounded-xl border border-line-2">
          {ex.tools.map((t) => (
            <li key={t.name} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
              <span className="flex items-center gap-2"><CircleCheck className="size-4 text-pos" />{t.name}</span>
              <span className="num text-muted">{money(t.cost)}/mo</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-[13px]">
          <span className="text-muted">Estimated monthly</span>
          <span className="num font-semibold">{money(total)}</span>
        </div>
        <p className="mt-3 text-[12px] text-muted">Within the {teamById.product.name} AI budget ({money(teamById.product.aiBudget - teamById.product.aiSpend)} remaining this month).</p>
      </div>
      <Footer note="Fulfilled by Deel IT alongside device shipping.">
        <Button onClick={close}>Cancel</Button>
        <Button variant="dark" onClick={() => { provisionSeat(); run(); }} disabled={state === "working"}>
          {state === "working" ? <LoaderCircle className="animate-spin" /> : <Laptop />}
          Provision seat
        </Button>
      </Footer>
    </>
  );
}

// --- Signals review --------------------------------------------------------------

function SignalsModal({ close }: { close: () => void }) {
  const { openWorker } = useApp();
  const people = Array.from(new Set([...overAllowance, ...highSpendLowOutput]));
  return (
    <>
      <div className="px-6 py-4">
        <p className="text-[13px] text-muted">
          These are planning signals, not judgments. High AI spend is often exploratory work, onboarding, or data gaps. Start with a conversation.
        </p>
        <ul className="mt-3 divide-y divide-line-2">
          {people.map((w) => {
            const over = overAllowance.includes(w);
            const low = highSpendLowOutput.includes(w);
            const team = byTeam.find((r) => r.team.id === w.team)!;
            return (
              <li key={w.id} className="flex items-center gap-3 py-3">
                <span className="grid size-8 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: team.team.color }}>{w.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">{w.name}</p>
                  <p className="text-[12px] text-muted">{team.team.name} · {countryByCode[w.country].name}</p>
                </div>
                <div className="flex gap-1">
                  {over && <Badge tone="risk">Over allowance</Badge>}
                  {low && <Badge tone="warning">Below cohort benchmark</Badge>}
                </div>
                <span className="num w-16 text-right text-[13px] font-medium">{money(w.aiSpend)}</span>
                <Button size="sm" variant="ghost" onClick={() => { close(); openWorker(w.id); }}>Details</Button>
              </li>
            );
          })}
        </ul>
      </div>
      <Footer note="Visible to Finance and People admins only.">
        <Button variant="primary" onClick={close}>Done</Button>
      </Footer>
    </>
  );
}

// --- Concept ------------------------------------------------------------------

function ConceptModal({ close }: { close: () => void }) {
  const { startTour, startDemo } = useApp();
  return (
    <>
      <div className="space-y-4 px-6 py-5 text-[13.5px] leading-relaxed text-ink-2">
        <p>
          <span className="font-semibold text-ink">Thesis.</span> Deel already sits close to the source of truth for global workforce economics: who works where, under which model, at what fully loaded cost. Sage connects that to output signals and AI spend, and turns it into decisions that flow straight into Deel Hire, EOR, Contractor, IT and Payroll.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium">
          {["Workforce Planning", "Sage", "Hire · EOR · Contractor · IT · Payroll"].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <ArrowRight className="size-3.5 text-subtle" />}
              <span className={cn("rounded-md px-2 py-1", i === 1 ? "bg-brand text-white" : "bg-canvas-2 text-ink-2")}>{s}</span>
            </React.Fragment>
          ))}
        </div>
        <p>
          <span className="font-semibold text-ink">Data.</span> Northwind Labs and its 180 workers are fictional. All figures derive from one seeded dataset, so totals reconcile across screens. Market assumptions are illustrative, not Deel pricing or legal/tax guidance.
        </p>
        <p className="rounded-xl bg-canvas p-3 text-[12.5px] text-muted">
          This is an independent portfolio prototype created for product exploration and is not affiliated with, endorsed by, or representative of Deel.
        </p>
      </div>
      <Footer>
        <Button onClick={() => { close(); startDemo(); }}>Executive demo</Button>
        <Button variant="primary" onClick={() => { close(); startTour(); }}>Take the tour</Button>
      </Footer>
    </>
  );
}

const titlesFor = (target: DecisionTarget): Record<Exclude<ModalId, null>, { title: string; description?: string; className?: string }> => ({
  hire: { title: "Deel Hire", description: "Create requisitions from this scenario" },
  compare: { title: "Employee (EOR) vs contractor", description: `${HIRES} Backend Engineers in ${countryByCode[target.country].name}` },
  export: { title: "Export report", className: "max-w-[560px]" },
  plan: { title: "Create workforce plan", description: "Add this scenario to Deel Workforce Planning" },
  provision: { title: "Provision AI access", description: "Via Deel IT" },
  signals: { title: "AI spend signals", description: "Review contributing factors before acting", className: "max-w-[640px]" },
  concept: { title: "About Sage", description: "Workforce intelligence — an independent concept", className: "max-w-[560px]" },
});

export function ModalHost() {
  const { modal, openModal, exportContext, advisor } = useApp();
  const close = () => openModal(null);
  const target = decisionTarget(advisor.scenario);
  const meta = modal ? titlesFor(target)[modal] : null;
  return (
    <Dialog open={!!modal} onOpenChange={(o) => !o && close()}>
      {modal && meta && (
        <DialogContent key={modal} title={meta.title} description={meta.description} className={meta.className}>
          {modal === "hire" && <HireModal close={close} target={target} />}
          {modal === "compare" && <CompareModal close={close} target={target} />}
          {modal === "export" && <ExportModal close={close} context={exportContext} target={target} />}
          {modal === "plan" && <PlanModal close={close} target={target} />}
          {modal === "provision" && <ProvisionModal close={close} />}
          {modal === "signals" && <SignalsModal close={close} />}
          {modal === "concept" && <ConceptModal close={close} />}
        </DialogContent>
      )}
    </Dialog>
  );
}

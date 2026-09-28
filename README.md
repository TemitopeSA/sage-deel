# Sage — Workforce Intelligence for Deel (concept)

> An independent product concept exploring how Deel could connect workforce economics, output signals, AI spend, and global hiring decisions into one decision intelligence layer.

**Live:** https://sage-deel.vercel.app

> **Disclaimer.** This is an independent portfolio prototype created for product exploration and is not affiliated with, endorsed by, or representative of Deel. All company, worker and financial data is fictional. Market assumptions are illustrative. Nothing here is Deel pricing or legal, tax, compensation or hiring advice.

---

## Product thesis

Deel already sits close to the source of truth for global workforce economics: every worker, country, employment model, payroll run, employer cost, device and software seat. Today that data mostly *records* decisions.

**Sage turns it into decisions**: DATA → INSIGHT → RECOMMENDATION → ACTION.

It is designed as a connective layer across capabilities Deel already has, not a replacement for them:

```
Deel Workforce Planning · Deel HR · Payroll · Global Salary Insights
                         ↓
                       Sage
                         ↓
Deel Hire · EOR · Contractor · IT · Payroll
```

## Target user

- **Primary:** CFO / VP Finance at a 200–2,000 person globally distributed company.
- **Secondary:** VP Engineering, VP Sales, Head of People, IT leaders, Finance business partners.
- **Demo company:** Northwind Labs, a fictional B2B SaaS company with 180 workers in 8 countries (60% EOR, 25% contractors, 15% employees).

## Problem

Workforce cost, workforce output, AI/software spend and hiring decisions live in different tools. A CFO can see payroll, but not what that payroll produces. AI spend is growing as a new workforce cost layer with no link to leverage. And "where should we hire next?" is answered with generic salary tables instead of the company's own economics.

## Solution: four connected experiences

| Screen | Question it answers | Hands off to |
|---|---|---|
| **Overview** `/sage` | What does my workforce actually cost, and what's changing? | Team Economics, country detail |
| **Team Economics** `/sage/team-economics` | Where do we get the most output per dollar? | Worker detail, cohort comparison |
| **AI Spend** `/sage/ai-spend` | Is AI spend creating leverage? | Smart Routing, **Deel IT** provisioning |
| **Hiring Advisor** `/sage/hiring-advisor` | Where should I hire the next 10 people, and how? | **Deel Hire**, **EOR / Contractor**, Finance, **Workforce Planning** |

### Core workflows

1. **Explain a number.** Every key metric has an ⓘ breakdown (base, employer taxes, benefits, platform fees, equipment, software, AI).
2. **Cost → output.** A cost-vs-output scatter of all 180 workers, filterable by team, country and worker type; click any dot for a side panel with cohort benchmark and guardrails.
3. **AI leverage.** AI spend change vs output change by team; Smart Routing toggle with animated projected savings; alerts; seat provisioning via Deel IT.
4. **Decide and act.** The Hiring Advisor visibly reasons through workforce data → cost → output → country economics → employment model → scenario → recommendation, then offers one-click actions into Deel.

### Responsible design

The Output Index is an **illustrative composite of connected activity signals for planning and trend analysis, not an employee performance score.** Copy avoids surveillance framing ("cost/output outlier", "review contributing factors", "planning signal"), and individual views note access limits.

## Demo instructions

- **First visit:** a welcome panel offers the **2-minute tour**, **Explore myself**, or **Executive demo**.
- **Product tour:** 8 spotlight steps across all four screens. Replay from the **?** menu or `⌘K → Start Product Tour`. Keys: `←` `→` `Esc`.
- **Executive demo mode:** top bar **Executive demo** (or `⌘K`). Auto-plays a ~1:40 voice-narrated walkthrough built for a Loom recording: Overview → Team Economics → AI Spend → Hiring Advisor → Action. Keys: `Space` pause/replay, `←` `→` skip, `Esc` exit. When it finishes, the play button becomes **Replay**. Narration can be muted from the control bar.
- **Command palette:** `⌘K` / `Ctrl+K`.
- **Concept mode:** the pill in the top bar explains the concept and data.

Tour completion, welcome state, demo mode, narration on/off and Smart Routing are stored in `localStorage`.

### Demo narration

Captions and narration live in `data/demoScript.json` (with optional `speech` text for pronunciation). Audio is pre-rendered to `public/voice/*.m4a` with macOS text-to-speech, and clip lengths go into `data/voiceManifest.json` so each beat lasts at least as long as its narration.

```bash
npm run voice                                   # default voice (Samantha)
VOICE="Ava (Premium)" RATE=175 npm run voice    # any installed macOS voice
```

## Analytics

Vercel Web Analytics is enabled (`@vercel/analytics`). Beyond page views, Sage sends anonymous product events: `tour_started`, `tour_closed` (with step), `demo_started`, `demo_completed`, `advisor_asked` (scenario), `action_opened` (Deel Hire, export, plan…), `welcome_explore`, and `smart_routing_enabled`. Custom events need a Vercel Pro plan to show in the dashboard; page views work on every plan.

## Architecture

```
app/
  sage/                     Overview
  sage/team-economics/      Team Economics
  sage/ai-spend/            AI Spend
  sage/hiring-advisor/      Hiring Advisor
components/
  layout/     Deel-style shell: sidebar, top bar, toasts
  dashboard/  KPI cards, insights, country economics
  team/       filters, connectors, team table, worker panel
  ai-spend/   budgets, tools, Smart Routing, alerts, provisioning
  charts/     Recharts: cost vs output, AI leverage
  advisor/    reasoning trace, scenario table, responses, actions
  modals/     Deel Hire, export, workforce plan, EOR vs contractor, provisioning
  tour/       spotlight tour, welcome panel, executive demo
  command/    ⌘K palette (cmdk)
  ui/         primitives (button, card, badge, dialog, select, switch, info tip)
data/         seeded dataset: workers, teams, countries, AI spend, insights, hiring scenarios
lib/          metrics (single source of derived numbers), store, hooks, formatting
types/        TypeScript interfaces
```

**One dataset, everything derived.** `data/workers.ts` deterministically generates 180 workers (seeded PRNG) with full cost components. Every screen derives from it via `lib/metrics.ts`, so totals reconcile:

- Σ worker fully loaded cost = **$2,840,400** = Overview total = Σ countries = Σ teams
- Σ worker AI spend = Σ team AI spend = Σ tool spend = **$96,420**
- Hiring scenarios are modeled from Northwind's own engineering cohort in each market, re-costed per employment model, and scored on cost, expected output, compliance, talent and speed.

No backend, no auth, no external AI calls. Hiring Advisor responses are deterministic and scripted from the dataset.

## Technology

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Radix UI primitives (shadcn-style components) · Recharts · Lucide · cmdk

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Deployed on Vercel as a static Next.js app, with no environment variables.

```bash
npx vercel --prod
```

---

Built by Temitope as a product exploration. Deel is a trademark of its owner; this project uses no Deel logos or assets (the "deel." wordmark is plain text).

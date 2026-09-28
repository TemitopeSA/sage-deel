import { aiTools, AI_BUDGET, AI_DAILY_RUN_RATE, DAYS_REMAINING, routableShare } from "@/data/aiSpend";
import { teams } from "@/data/teams";
import { company, sum } from "@/lib/metrics";

const toolTotal = sum(aiTools.map((t) => t.spend));
if (toolTotal !== company.ai) {
  // Guardrail: tool billing must reconcile to worker-level AI spend.
  console.warn(`AI tool totals (${toolTotal}) do not reconcile with worker AI spend (${company.ai}).`);
}

export const aiSummary = {
  spend: company.ai,
  budget: AI_BUDGET,
  utilization: company.ai / AI_BUDGET,
  projected: company.ai + AI_DAILY_RUN_RATE * DAYS_REMAINING,
};

export const routingSavingsMonthly = Math.round(sum(teams.map((t) => t.aiSpend * routableShare[t.id])));
export const routedMonthly = company.ai - routingSavingsMonthly;
export const routingSavingsQuarterly = routingSavingsMonthly * 3;

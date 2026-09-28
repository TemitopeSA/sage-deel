import { company, engineering, PREV_MONTH_AI, PREV_MONTH_TOTAL_COST } from "@/lib/metrics";

// Six-month illustrative history. The final two points reconcile to the current dataset.
// August includes quarterly sales commissions, hence the dip into September.
const costRatios = [0.9, 0.925, 0.948, 0.97];
const aiRatios = [0.52, 0.61, 0.7, 0.8];

export const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export const costHistory = months.map((m, i) => ({
  month: m,
  cost: i < 4 ? Math.round(PREV_MONTH_TOTAL_COST * costRatios[i]) : i === 4 ? PREV_MONTH_TOTAL_COST : company.cost,
  ai: i < 4 ? Math.round(PREV_MONTH_AI * aiRatios[i]) : i === 4 ? PREV_MONTH_AI : company.ai,
}));


// Engineering cost and output, indexed to June = 100 (start of the trailing 90-day window).
const shape = [-0.35, -0.15, 0, 0.3, 0.65, 1];
export const engineeringIndex = months.map((m, i) => ({
  month: m,
  output: Math.round((100 + engineering.outputChange * 100 * shape[i]) * 10) / 10,
  cost: Math.round((100 + engineering.costChange * 100 * (shape[i] < 0 ? shape[i] * 0.6 : shape[i])) * 10) / 10,
}));

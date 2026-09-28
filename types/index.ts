export type CountryCode = "US" | "UK" | "DE" | "PL" | "PT" | "BR" | "NG" | "IN";

export type TeamId =
  | "platform"
  | "product"
  | "data"
  | "sales"
  | "success"
  | "ga";

export type WorkerType = "EOR" | "Contractor" | "Employee";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  region: string;
  currency: string;
  /** Base compensation relative to the US for the same role and level (illustrative). */
  compMultiplier: number;
  /** Employer statutory contributions as a share of base (illustrative). */
  employerTaxRate: number;
  /** Monthly employer benefits cost per employee/EOR worker (illustrative). */
  benefitsMonthly: number;
  timeToHire: string;
  talentAvailability: "High" | "Medium" | "Low";
  complianceComplexity: "Low" | "Medium" | "High";
  timezone: string;
}

export interface Team {
  id: TeamId;
  name: string;
  short: string;
  /** US monthly base comp for a mid-level role (illustrative). */
  baseUSMonthly: number;
  outputMean: number;
  softwareMonthly: number;
  outputSignals: string[];
  outputUnit: string;
  isEngineering: boolean;
  /** 90-day change figures, used for trend and AI leverage views. */
  trend: {
    cost: number;
    output: number;
    aiSpendPrev: number;
  };
  /** Cost per output point versus an anonymized peer benchmark (positive = more expensive than peers). */
  vsPeerBenchmark: number;
  aiBudget: number;
  aiSpend: number;
  color: string;
}

export interface Worker {
  id: string;
  name: string;
  initials: string;
  role: string;
  level: "Associate" | "Mid" | "Senior" | "Staff" | "Lead";
  team: TeamId;
  country: CountryCode;
  workerType: WorkerType;
  baseSalary: number;
  employerTaxes: number;
  benefits: number;
  deelFees: number;
  equipmentCost: number;
  softwareCost: number;
  aiSpend: number;
  fullyLoadedMonthlyCost: number;
  outputIndex: number;
  startDate: string;
}

export interface AiTool {
  name: string;
  spend: number;
  seats: number;
  color: string;
}

export interface HiringOption {
  id: string;
  country: CountryCode;
  model: WorkerType;
  annualCost: number;
  monthlyPerHire: number;
  timeToHire: string;
  talentAvailability: string;
  complianceComplexity: string;
  expectedOutput: number;
  deltaVsBenchmark: number;
  cohortSize: number;
  score: number;
  note: string;
}

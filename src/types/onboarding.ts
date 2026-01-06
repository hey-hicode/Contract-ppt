export type RoleId = "founder" | "freelancer" | "employee" | "investor";

export type GoalId =
  | "ip_protection"
  | "liability"
  | "flexibility"
  | "contract_review"
  | "compliance"
  | "equity";

export type ContractTypeId =
  | "nda"
  | "saas"
  | "employment"
  | "contractor"
  | "investment"
  | "vendor";

export type RiskToleranceId = "conservative" | "balanced" | "aggressive";

export interface OnboardingData {
  role: RoleId | null;
  goals: GoalId[];
  contractTypes: ContractTypeId[];
  riskTolerance: RiskToleranceId | null;
}

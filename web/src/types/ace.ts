export type AceInput = {
  project_name: string
  sector: "gov" | "health" | "bank" | "fund"
  budget: number
  duration_months: number
  beneficiaries: number
  esg_score: number
  risk_index: number
  execution_capacity: number
  scalability: number
  strategic_value: number
  compliance_score: number
  expected_roi: number
}

export type AceFeatures = {
  efficiency: number
  governance: number
  sustainability: number
  impact: number
  resilience: number
}

export type AceScoreResult = {
  ace_score: number
  tier: "AAA" | "A" | "B" | "C"
  decision: "AUTO_APPROVED" | "REVIEW_REQUIRED" | "CONDITIONAL_APPROVAL" | "BLOCKED"
  kernel: string
  rationale?: string
}

export type KernelInput = AceInput

export type KernelEnvelope = {
  input: KernelInput
  features: AceFeatures
  result: AceScoreResult
}

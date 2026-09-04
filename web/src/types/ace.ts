import type { EvidenceProvenanceKind } from "./agency"

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

export type ReadinessTier = "AAA" | "A" | "B" | "C"

export type ReadinessBand =
  | "HIGH_ALIGNMENT"
  | "MODERATE_ALIGNMENT"
  | "DEVELOPING_ALIGNMENT"
  | "LOW_ALIGNMENT"

export type AceScoreResult = {
  contract_version: "2.0"
  ace_score: number
  tier: ReadinessTier
  readiness_band: ReadinessBand
  decision: "REVIEW_REQUIRED"
  human_review_required: true
  assessment_basis: "INTERNAL_HEURISTIC"
  context_provenance: EvidenceProvenanceKind
  kernel: string
  rationale: string
  limitations: string[]
}

export type KernelInput = AceInput

export type KernelEnvelope = {
  input: KernelInput
  features: AceFeatures
  result: AceScoreResult
}

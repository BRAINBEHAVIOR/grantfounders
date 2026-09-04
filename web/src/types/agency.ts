export type EvidenceProvenanceKind =
  | "OBSERVED"
  | "DERIVED"
  | "ESTIMATED"
  | "SIMULATED"
  | "INTERNAL_HEURISTIC"

export type EvidenceProvenance = {
  kind: EvidenceProvenanceKind
  source: string
  limitations: string[]
}

export type AgencyDNA = {
  name: string
  risk_appetite: number
  innovation_bias: number
  compliance_bias: number
  strategic_priorities: string[]
}

export type CapabilityVector = {
  execution_capacity: number
  data_maturity: number
  governance_strength: number
}

export type AgencyContext = {
  dna: AgencyDNA
  capabilities: CapabilityVector
  provenance: EvidenceProvenance
}

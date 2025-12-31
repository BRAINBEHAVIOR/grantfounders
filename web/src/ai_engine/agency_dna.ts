import type { AgencyContext } from "../types/agency"

export const DEFAULT_AGENCY_CONTEXT: AgencyContext = {
  dna: {
    name: "GrantFounders DIOS",
    risk_appetite: 0.35,
    innovation_bias: 0.6,
    compliance_bias: 0.8,
    strategic_priorities: ["esg", "governance", "impact"],
  },
  capabilities: {
    execution_capacity: 0.8,
    data_maturity: 0.7,
    governance_strength: 0.9,
  },
}

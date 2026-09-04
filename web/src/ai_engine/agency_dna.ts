import type { AgencyContext } from "../types/agency"

export const INTERNAL_HEURISTIC_CONTEXT: AgencyContext = {
  dna: {
    name: "GrantFounders internal heuristic baseline",
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
  provenance: {
    kind: "INTERNAL_HEURISTIC",
    source: "Owner-defined baseline values embedded in the GF-777ACE source",
    limitations: [
      "This context is not an observed profile of any government agency or funder.",
      "The values have not been outcome-calibrated or externally validated.",
    ],
  },
}

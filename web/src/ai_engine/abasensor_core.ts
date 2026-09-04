import type { AceFeatures, AceScoreResult } from "../types/ace"
import type { AgencyContext } from "../types/agency"
import { KERNEL_VERSION } from "../config/constants"
import { classifyReadinessScore } from "./readiness-classification"

const BASE_WEIGHTS = {
  efficiency: 0.25,
  governance: 0.25,
  sustainability: 0.2,
  impact: 0.2,
  resilience: 0.1,
}

function normalizeScore(score: number) {
  return Math.max(0, Math.min(100, score))
}

export function computeAceScore(features: AceFeatures, context: AgencyContext): AceScoreResult {
  const biasBoost = 1 + context.dna.innovation_bias * 0.05 - context.dna.compliance_bias * 0.03

  const weighted =
    features.efficiency * BASE_WEIGHTS.efficiency +
    features.governance * BASE_WEIGHTS.governance * (1 + context.dna.compliance_bias * 0.05) +
    features.sustainability * BASE_WEIGHTS.sustainability +
    features.impact * BASE_WEIGHTS.impact * (1 + context.dna.innovation_bias * 0.04) +
    features.resilience * BASE_WEIGHTS.resilience

  const ace_score = Math.round(normalizeScore(weighted * biasBoost))
  const classification = classifyReadinessScore(ace_score)

  return {
    contract_version: "2.0",
    ace_score,
    ...classification,
    assessment_basis: "INTERNAL_HEURISTIC",
    context_provenance: context.provenance.kind,
    kernel: KERNEL_VERSION,
    rationale:
      "Internal readiness-alignment screening computed from owner-defined heuristic inputs and weights. Qualified human review is always required.",
    limitations: [
      "Not a government or funder eligibility, approval, award, win-probability, or funding decision.",
      "The score is not outcome-calibrated and must not be interpreted as a probability.",
      ...context.provenance.limitations,
    ],
  }
}

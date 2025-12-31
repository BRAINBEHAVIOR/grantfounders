import type { AceFeatures, AceScoreResult } from "../types/ace"
import type { AgencyContext } from "../types/agency"
import { KERNEL_VERSION } from "../config/constants"
import { DEFAULT_AGENCY_CONTEXT } from "./agency_dna"

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

function deriveDecision(score: number): { tier: AceScoreResult["tier"]; decision: AceScoreResult["decision"] } {
  if (score >= 85) return { tier: "AAA", decision: "AUTO_APPROVED" }
  if (score >= 70) return { tier: "A", decision: "REVIEW_REQUIRED" }
  if (score >= 55) return { tier: "B", decision: "CONDITIONAL_APPROVAL" }
  return { tier: "C", decision: "BLOCKED" }
}

export function computeAceScore(features: AceFeatures, context: AgencyContext = DEFAULT_AGENCY_CONTEXT): AceScoreResult {
  const biasBoost = 1 + context.dna.innovation_bias * 0.05 - context.dna.compliance_bias * 0.03

  const weighted =
    features.efficiency * BASE_WEIGHTS.efficiency +
    features.governance * BASE_WEIGHTS.governance * (1 + context.dna.compliance_bias * 0.05) +
    features.sustainability * BASE_WEIGHTS.sustainability +
    features.impact * BASE_WEIGHTS.impact * (1 + context.dna.innovation_bias * 0.04) +
    features.resilience * BASE_WEIGHTS.resilience

  const ace_score = Math.round(normalizeScore(weighted * biasBoost))
  const { tier, decision } = deriveDecision(ace_score)

  return {
    ace_score,
    tier,
    decision,
    kernel: KERNEL_VERSION,
    rationale: "Computed via GF-777ACE weighting across efficiency, governance, sustainability, impact, and resilience.",
  }
}

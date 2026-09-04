import type { ReadinessBand, ReadinessTier } from "../types/ace"

export type ReadinessClassification = {
  tier: ReadinessTier
  readiness_band: ReadinessBand
  decision: "REVIEW_REQUIRED"
  human_review_required: true
}

export function classifyReadinessScore(score: number): ReadinessClassification {
  if (!Number.isFinite(score)) {
    throw new RangeError("ACE score must be a finite number")
  }

  const normalized = Math.max(0, Math.min(100, score))

  if (normalized >= 85) {
    return {
      tier: "AAA",
      readiness_band: "HIGH_ALIGNMENT",
      decision: "REVIEW_REQUIRED",
      human_review_required: true,
    }
  }

  if (normalized >= 70) {
    return {
      tier: "A",
      readiness_band: "MODERATE_ALIGNMENT",
      decision: "REVIEW_REQUIRED",
      human_review_required: true,
    }
  }

  if (normalized >= 55) {
    return {
      tier: "B",
      readiness_band: "DEVELOPING_ALIGNMENT",
      decision: "REVIEW_REQUIRED",
      human_review_required: true,
    }
  }

  return {
    tier: "C",
    readiness_band: "LOW_ALIGNMENT",
    decision: "REVIEW_REQUIRED",
    human_review_required: true,
  }
}

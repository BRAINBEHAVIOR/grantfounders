import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import { classifyReadinessScore } from "../src/ai_engine/readiness-classification.ts"

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function read(relativePath) {
  return readFileSync(join(webRoot, relativePath), "utf8")
}

test("readiness thresholds are deterministic and always require human review", () => {
  const cases = [
    { score: -1, tier: "C", band: "LOW_ALIGNMENT" },
    { score: 54, tier: "C", band: "LOW_ALIGNMENT" },
    { score: 55, tier: "B", band: "DEVELOPING_ALIGNMENT" },
    { score: 69, tier: "B", band: "DEVELOPING_ALIGNMENT" },
    { score: 70, tier: "A", band: "MODERATE_ALIGNMENT" },
    { score: 84, tier: "A", band: "MODERATE_ALIGNMENT" },
    { score: 85, tier: "AAA", band: "HIGH_ALIGNMENT" },
    { score: 101, tier: "AAA", band: "HIGH_ALIGNMENT" },
  ]

  for (const expected of cases) {
    const actual = classifyReadinessScore(expected.score)
    assert.equal(actual.tier, expected.tier)
    assert.equal(actual.readiness_band, expected.band)
    assert.equal(actual.decision, "REVIEW_REQUIRED")
    assert.equal(actual.human_review_required, true)
  }
})

test("non-finite scores fail closed", () => {
  assert.throws(() => classifyReadinessScore(Number.NaN), RangeError)
  assert.throws(() => classifyReadinessScore(Number.POSITIVE_INFINITY), RangeError)
  assert.throws(() => classifyReadinessScore(Number.NEGATIVE_INFINITY), RangeError)
})

test("runtime contract contains no approval labels", () => {
  const oldLabels = [
    ["AUTO", "APPROVED"].join("_"),
    ["CONDITIONAL", "APPROVAL"].join("_"),
  ]

  const runtimeFiles = [
    "src/types/ace.ts",
    "src/ai_engine/abasensor_core.ts",
    "src/ai_engine/gf777ace_kernel.ts",
    "src/ai_engine/agency_dna.ts",
    "src/components/manus/ProjectEvaluation.tsx",
    "API_REFERENCE.md",
  ]

  for (const relativePath of runtimeFiles) {
    const content = read(relativePath)
    for (const label of oldLabels) {
      assert.equal(content.includes(label), false, `${relativePath} still contains ${label}`)
    }
  }
})

test("evaluation UI does not fabricate probabilities, confidence, benchmarks, or public keys", () => {
  const content = read("src/components/manus/ProjectEvaluation.tsx")
  const forbidden = [
    "funding_probability",
    "confidence_level",
    "similar_projects_funded",
    "average_funding_amount",
    "success_rate_category",
    "percentile_ranking",
    "defaultResult",
    "NEXT_PUBLIC_API_KEY",
  ]

  for (const token of forbidden) {
    assert.equal(content.includes(token), false, `ProjectEvaluation.tsx still contains ${token}`)
  }
})

test("dashboard has no hardcoded funding outcomes", () => {
  const content = read("src/components/manus/Dashboard.tsx")
  const forbidden = [
    "funding_probability",
    "defaultRecentProjects",
    "successRate",
    "totalFunding",
    "match_score",
  ]

  for (const token of forbidden) {
    assert.equal(content.includes(token), false, `Dashboard.tsx still contains ${token}`)
  }
})

test("public Manus prototype dump is not shipped as static content", () => {
  assert.equal(existsSync(join(webRoot, "public", "manus")), false)
})

test("internal context declares provenance", () => {
  const content = read("src/ai_engine/agency_dna.ts")
  assert.match(content, /INTERNAL_HEURISTIC_CONTEXT/)
  assert.match(content, /kind:\s*"INTERNAL_HEURISTIC"/)
  assert.match(content, /not an observed profile/)
})

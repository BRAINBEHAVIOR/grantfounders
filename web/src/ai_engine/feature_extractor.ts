import type { AceFeatures, AceInput } from "../types/ace"

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export function extractFeatures(input: AceInput): AceFeatures {
  const efficiency = clamp((input.execution_capacity * 0.6 + input.scalability * 0.4) * 1.05)
  const governance = clamp((input.compliance_score * 0.7 + (100 - input.risk_index) * 0.3))
  const sustainability = clamp(input.esg_score * 0.9 + input.strategic_value * 0.1)
  const impact = clamp(
    Math.log10(Math.max(1, input.beneficiaries)) * 10 + input.expected_roi * 2 + input.strategic_value * 0.5
  )
  const resilience = clamp(100 - input.risk_index + input.duration_months * 0.2)

  return { efficiency, governance, sustainability, impact, resilience }
}

import type { KernelEnvelope, KernelInput } from "../types/ace"
import { extractFeatures } from "./feature_extractor"
import { computeAceScore } from "./abasensor_core"
import { INTERNAL_HEURISTIC_CONTEXT } from "./agency_dna"

export function runGF777AceKernel(input: KernelInput): KernelEnvelope {
  const features = extractFeatures(input)
  const result = computeAceScore(features, INTERNAL_HEURISTIC_CONTEXT)

  return { input, features, result }
}

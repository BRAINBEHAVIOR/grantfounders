import type { AceScoreResult, KernelInput } from "@/src/types/ace"
import { runGF777AceKernel } from "@/src/ai_engine/gf777ace_kernel"

export type AceInput = KernelInput

export function scoreACE(input: AceInput): AceScoreResult {
  const { result } = runGF777AceKernel(input)
  return result
}

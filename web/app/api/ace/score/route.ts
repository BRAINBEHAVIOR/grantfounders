import { NextResponse } from "next/server"
import { z } from "zod"
import { scoreACE } from "@/src/lib/ace-kernel"
import { verifyAuth } from "@/src/services/api-key-guard"
import { logUsage } from "@/src/services/metering"
import { KERNEL_VERSION } from "@/src/config/constants"

export const runtime = "nodejs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gf-secret",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const schema = z.object({
  project_name: z.string(),
  sector: z.enum(["gov", "health", "bank", "fund"]),
  budget: z.number(),
  duration_months: z.number(),
  beneficiaries: z.number(),
  esg_score: z.number(),
  risk_index: z.number(),
  execution_capacity: z.number(),
  scalability: z.number(),
  strategic_value: z.number(),
  compliance_score: z.number(),
  expected_roi: z.number(),
})

export async function POST(req: Request) {
  try {
    // Verify authentication (supports both x-gf-secret and standard API key)
    const authContext = await verifyAuth(req)
    if (!authContext) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required. Use x-gf-secret (owner) or Authorization Bearer (API key)" } },
        { status: 401, headers: corsHeaders }
      )
    }

    // Parse and validate request body
    const body = schema.parse(await req.json())
    
    // Compute ACE score
    const result = scoreACE(body)

    // Log usage (skips for owner context)
    await logUsage(authContext.org_id, authContext.api_key_id, "ace/score")

    return NextResponse.json(
      { ok: true, data: { ...result, kernel: KERNEL_VERSION } },
      { headers: corsHeaders }
    )
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", issues: err.errors } },
        { status: 400, headers: corsHeaders }
      )
    }
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error", detail: message } },
      { status: 500, headers: corsHeaders }
    )
  }
}

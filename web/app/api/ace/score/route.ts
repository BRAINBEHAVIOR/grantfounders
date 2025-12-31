import { NextResponse } from "next/server"
import { z } from "zod"
import { scoreACE } from "@/src/lib/ace-kernel"
import { verifyApiKey } from "@/src/services/api-key-guard"
import { logUsage } from "@/src/services/metering"
import { KERNEL_VERSION } from "@/src/config/constants"

export const runtime = "nodejs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    const apiKey = (req.headers.get("authorization") || "").replace("Bearer ", "").trim()
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401, headers: corsHeaders })
    }

    const org = await verifyApiKey(apiKey)
    if (!org) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403, headers: corsHeaders })
    }

    const body = schema.parse(await req.json())
    const result = scoreACE(body)

    await logUsage(org.org_id as string, org.api_key_id as string, "ace/score")

    return NextResponse.json({ ...result, kernel: KERNEL_VERSION }, { headers: corsHeaders })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.errors }, { status: 400, headers: corsHeaders })
    }
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Unexpected error", detail: message }, { status: 500, headers: corsHeaders })
  }
}

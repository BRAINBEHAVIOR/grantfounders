import { NextResponse } from "next/server"
import { z } from "zod"
import { scoreACE } from "@/lib/ace-kernel"
import { verifyApiKey } from "@/services/api-key-guard"
import { logUsage } from "@/services/metering"

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
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const org = await verifyApiKey(apiKey)
    if (!org) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 })
    }

    const body = schema.parse(await req.json())
    const result = scoreACE(body)

    await logUsage(org.org_id as string, org.api_key_id as string, "ace/score")

    return NextResponse.json({ ...result, kernel: "GF-777ACE-Quantum-v3.0" })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Unexpected error", detail: err?.message || String(err) }, { status: 500 })
  }
}

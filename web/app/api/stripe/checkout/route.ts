import { NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { createProCheckoutSession } from "@/src/services/stripe.service"

export const runtime = "nodejs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const schema = z.object({
  email: z.string().email().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", issues: parsed.error.issues } },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = await createProCheckoutSession(parsed.data.email)
    return NextResponse.json(
      { ok: true, data: { url: session.url } },
      { headers: corsHeaders }
    )
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { ok: false, error: { code: "STRIPE_ERROR", message: err.message } },
        { status: err.statusCode || 400, headers: corsHeaders }
      )
    }
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500, headers: corsHeaders }
    )
  }
}

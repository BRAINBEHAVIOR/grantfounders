import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createProCheckoutSession } from "@/src/services/stripe.service"

export async function POST(req: Request) {
  try {
    const { email } = (await req.json().catch(() => ({ email: undefined }))) as { email?: string }
    const session = await createProCheckoutSession(email)
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 })
    }
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

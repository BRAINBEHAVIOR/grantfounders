import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createApiKey, createMembership, createOrgForEmail, createUserIfNeeded } from "@/src/services/supabase.service"
import { parseStripeEvent } from "@/src/services/stripe.service"
import { getLogger } from "@/src/lib/logger"

export const runtime = "nodejs"

const logger = getLogger("stripe-webhook")

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = parseStripeEvent(payload, sig)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn("signature verification failed", { error: message })
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_details?.email
      if (!email) {
        return NextResponse.json({ error: "Missing customer email" }, { status: 400 })
      }

      const user = await createUserIfNeeded(email)
      const org = await createOrgForEmail(email)
      await createMembership(org.id, user.id, "owner")
      const api_key = await createApiKey(org.id, "default")

      return NextResponse.json({ api_key })
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error("webhook handling failed", { error: message, type: event?.type })
    return NextResponse.json({ error: "Webhook handling failed", detail: message }, { status: 500 })
  }
}

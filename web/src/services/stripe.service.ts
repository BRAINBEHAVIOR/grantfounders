import Stripe from "stripe"
import { DEFAULT_CANCEL_URL, DEFAULT_SUCCESS_URL, STRIPE_PRICE_IDS } from "@/src/config/constants"
import { getLogger } from "@/src/lib/logger"

const logger = getLogger("stripe")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
})

export async function createProCheckoutSession(customerEmail?: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [{ price: STRIPE_PRICE_IDS.pro, quantity: 1 }],
    success_url: DEFAULT_SUCCESS_URL,
    cancel_url: DEFAULT_CANCEL_URL,
  })

  logger.info("created stripe checkout session", { session: session.id })
  return session
}

export function parseStripeEvent(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured")
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

export const stripeClient = stripe

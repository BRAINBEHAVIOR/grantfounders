import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18",
})

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 })
    }
    return NextResponse.json({ error: "Unexpected error", detail: err?.message || String(err) }, { status: 500 })
  }
}

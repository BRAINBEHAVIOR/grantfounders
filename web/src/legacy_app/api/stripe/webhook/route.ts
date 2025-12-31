import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/services/api-key-guard"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18",
})

const secret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing Stripe signature or secret" }, { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err: any) {
    return NextResponse.json({ error: "Signature verification failed", detail: err?.message || String(err) }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_details?.email
      if (!email) {
        return NextResponse.json({ error: "Missing customer email" }, { status: 400 })
      }

      const { data: user, error: userErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      })
      if (userErr || !user?.user) {
        return NextResponse.json({ error: "User creation failed", detail: userErr?.message }, { status: 500 })
      }

      const { data: org, error: orgErr } = await supabase.from("orgs").insert({ name: email }).select().single()
      if (orgErr || !org) {
        return NextResponse.json({ error: "Org creation failed", detail: orgErr?.message }, { status: 500 })
      }

      const { error: memberErr } = await supabase.from("org_memberships").insert({
        org_id: org.id,
        user_id: user.user.id,
        role: "owner",
      })
      if (memberErr) {
        return NextResponse.json({ error: "Membership insert failed", detail: memberErr.message }, { status: 500 })
      }

      const { data: key, error: keyErr } = await supabase.rpc("create_api_key", {
        p_org: org.id,
        p_name: "default",
      })
      if (keyErr) {
        return NextResponse.json({ error: "API key creation failed", detail: keyErr.message }, { status: 500 })
      }

      return NextResponse.json({ api_key: key })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Webhook handling failed", detail: err?.message || String(err) }, { status: 500 })
  }
}

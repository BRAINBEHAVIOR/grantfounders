import { NextResponse } from "next/server"
import { z } from "zod"
import { signInWithEmail, signUpWithEmail } from "@/src/services/auth.service"

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
  email: z.string().email(),
  password: z.string().min(6),
  action: z.enum(["signin", "signup"]).default("signin"),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", issues: parsed.error.issues } },
        { status: 400, headers: corsHeaders }
      )
    }

    const { email, password, action } = parsed.data

    if (action === "signup") {
      const data = await signUpWithEmail(email, password)
      return NextResponse.json(
        { ok: true, data: { user: data.user, session: data.session } },
        { headers: corsHeaders }
      )
    }

    const data = await signInWithEmail(email, password)
    return NextResponse.json(
      { ok: true, data: { user: data.user, session: data.session } },
      { headers: corsHeaders }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auth failed"
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message } },
      { status: 401, headers: corsHeaders }
    )
  }
}

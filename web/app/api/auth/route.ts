import { NextResponse } from "next/server"
import { z } from "zod"
import { signInWithEmail, signUpWithEmail } from "@/src/services/auth.service"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  action: z.enum(["signin", "signup"]).default("signin"),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  const { email, password, action } = parsed.data

  try {
    if (action === "signup") {
      const data = await signUpWithEmail(email, password)
      return NextResponse.json({ user: data.user, session: data.session })
    }

    const data = await signInWithEmail(email, password)
    return NextResponse.json({ user: data.user, session: data.session })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auth failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}

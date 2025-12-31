import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdmin } from "./supabase.service"
import { getLogger } from "@/src/lib/logger"

const logger = getLogger("auth")

const supabaseAuth = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
})

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
  if (error) throw error
  logger.info("user signed in", { email })
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabaseAuth.auth.signUp({ email, password })
  if (error) throw error
  logger.info("user signed up", { email })
  return data
}

export async function getUserFromAccessToken(token: string) {
  const { data, error } = await supabaseAuth.auth.getUser(token)
  if (error) throw error
  return data.user
}

export async function elevateUserToOrgOwner(userId: string, orgId: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin.from("org_memberships").insert({ org_id: orgId, user_id: userId, role: "owner" })
  if (error) throw error
  logger.info("user elevated to owner", { userId, orgId })
}

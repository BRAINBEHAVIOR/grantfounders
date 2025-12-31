import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { getLogger } from "@/src/lib/logger"

const logger = getLogger("supabase")

let supabaseAdmin: SupabaseClient | null = null

function ensureAdminClient() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    logger.info("Supabase admin client initialized")
  }
  return supabaseAdmin
}

export function getSupabaseAdmin() {
  return ensureAdminClient()
}

export async function verifyApiKey(key: string) {
  const client = ensureAdminClient()
  const { data, error } = await client.rpc("verify_api_key", { p_key: key })
  if (error || !data || !data.length || !data[0].is_active) return null
  return data[0]
}

export async function createOrgForEmail(email: string) {
  const client = ensureAdminClient()
  const { data, error } = await client.from("orgs").insert({ name: email }).select().single()
  if (error) throw error
  return data
}

export async function createMembership(orgId: string, userId: string, role: string) {
  const client = ensureAdminClient()
  const { error } = await client.from("org_memberships").insert({ org_id: orgId, user_id: userId, role })
  if (error) throw error
}

export async function createApiKey(orgId: string, name = "default") {
  const client = ensureAdminClient()
  const { data, error } = await client.rpc("create_api_key", { p_org: orgId, p_name: name })
  if (error) throw error
  return data
}

export async function createUserIfNeeded(email: string) {
  const client = ensureAdminClient()
  const { data, error } = await client.auth.admin.createUser({ email, email_confirm: true })
  if (error) throw error
  if (!data.user) throw new Error("User creation returned null user")
  return data.user
}

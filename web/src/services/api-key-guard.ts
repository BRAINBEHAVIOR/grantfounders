import { getSupabaseAdmin, verifyApiKey as verify } from "./supabase.service"

export const supabase = getSupabaseAdmin()

export interface AuthContext {
  org_id: string
  api_key_id: string
  plan?: string
  is_owner?: boolean
  is_active?: boolean
}

/**
 * Verifies API authentication using either:
 * 1. x-gf-secret header (owner bypass - server-to-server only)
 * 2. Standard API key from Supabase (client authentication)
 * 
 * @param request - Next.js Request object
 * @returns AuthContext or null if authentication fails
 */
export async function verifyAuth(request: Request): Promise<AuthContext | null> {
  // Check for owner bypass using x-gf-secret header
  const gfSecret = request.headers.get("x-gf-secret")
  if (gfSecret && process.env.GF_SECRET_KEY && gfSecret === process.env.GF_SECRET_KEY) {
    // Owner bypass - return enterprise-level context
    return {
      org_id: "OWNER",
      api_key_id: "OWNER",
      plan: "enterprise",
      is_owner: true,
      is_active: true
    }
  }

  // Standard API key verification via Authorization header
  const authHeader = request.headers.get("authorization") || ""
  const apiKey = authHeader.replace("Bearer ", "").trim()
  
  if (!apiKey) {
    return null
  }

  // Verify API key against Supabase
  const result = await verify(apiKey)
  if (!result) {
    return null
  }

  return {
    org_id: result.org_id,
    api_key_id: result.api_key_id,
    plan: result.plan,
    is_active: result.is_active,
    is_owner: false
  }
}

/**
 * Legacy function - kept for backward compatibility
 * Prefer using verifyAuth() for new code
 */
export async function verifyApiKey(key: string) {
  return verify(key)
}

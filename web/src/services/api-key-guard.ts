import { getSupabaseAdmin, verifyApiKey as verify } from "./supabase.service"

export const supabase = getSupabaseAdmin()

export async function verifyApiKey(key: string) {
  return verify(key)
}

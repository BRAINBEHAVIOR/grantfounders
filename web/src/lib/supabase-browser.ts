import { createClient, SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

/**
 * Create a Supabase client for client-side use in React components.
 * This client uses public environment variables that are safe to expose to the browser.
 * Uses a singleton pattern to reuse the same client instance.
 */
export function supabaseBrowser() {
  if (browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Defensive check for missing environment variables
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    )
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return browserClient
}

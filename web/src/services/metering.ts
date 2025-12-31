import { getSupabaseAdmin } from "./supabase.service"
import { getLogger } from "@/src/lib/logger"

const logger = getLogger("metering")
const supabase = getSupabaseAdmin()

/**
 * Logs API usage to Supabase.
 * Skips logging for owner context (org_id="OWNER") to avoid database constraints.
 * 
 * @param org_id - Organization ID or "OWNER" for owner bypass
 * @param api_key_id - API key ID or "OWNER" for owner bypass
 * @param endpoint - Endpoint being accessed
 */
export async function logUsage(org_id: string, api_key_id: string, endpoint: string) {
  // Skip logging for owner bypass to avoid inserting invalid foreign keys
  if (org_id === "OWNER" || api_key_id === "OWNER") {
    logger.info("owner usage (not logged to database)", { endpoint })
    return
  }

  const { error } = await supabase.from("usage_events").insert({ org_id, api_key_id, endpoint })
  if (error) {
    logger.error("failed to log usage", { error: error.message, org_id, endpoint })
  }
}

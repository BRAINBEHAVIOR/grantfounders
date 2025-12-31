import { getSupabaseAdmin } from "./supabase.service"
import { getLogger } from "@/src/lib/logger"

const logger = getLogger("metering")
const supabase = getSupabaseAdmin()

export async function logUsage(org_id: string, api_key_id: string, endpoint: string) {
  const { error } = await supabase.from("usage_events").insert({ org_id, api_key_id, endpoint })
  if (error) {
    logger.error("failed to log usage", { error: error.message, org_id, endpoint })
  }
}

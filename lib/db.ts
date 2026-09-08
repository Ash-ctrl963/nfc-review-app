import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

/**
 * Server-only. This uses the service-role key, which bypasses Row Level
 * Security entirely. It must only ever be imported from API route
 * handlers or other server-only code — never from a "use client"
 * component, or the key would end up in the browser bundle.
 */
export const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey,
  { auth: { persistSession: false } }
);

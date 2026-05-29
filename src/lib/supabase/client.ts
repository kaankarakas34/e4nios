import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { supabasePublicKey, supabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  const url = supabaseUrl();
  const key = supabasePublicKey();

  if (!url || !key) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createBrowserClient<Database>(url, key);
}

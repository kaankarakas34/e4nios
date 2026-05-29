import { createClient } from "@supabase/supabase-js";

import { supabaseServerKey, supabaseUrl } from "@/lib/supabase/env";

export function createAdminClient() {
  const url = supabaseUrl();
  const key = supabaseServerKey();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

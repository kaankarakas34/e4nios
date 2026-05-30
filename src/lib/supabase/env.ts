export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function supabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function supabaseServerKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function missingSupabaseAdminEnvVars() {
  const missing: string[] = [];

  if (!supabaseUrl()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseServerKey()) {
    missing.push("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
  }

  return missing;
}

export function envHealthRows() {
  const rows = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      requiredFor: "Supabase connection",
      present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      requiredFor: "browser-safe Supabase client",
      present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    },
    {
      name: "SUPABASE_SECRET_KEY",
      requiredFor: "server-side CRM writes",
      present: Boolean(process.env.SUPABASE_SECRET_KEY),
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      requiredFor: "server-side CRM writes fallback",
      present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      optionalWhen: "SUPABASE_SECRET_KEY is present",
    },
    {
      name: "OPENROUTER_API_KEY",
      requiredFor: "AI orchestrator planning",
      present: Boolean(process.env.OPENROUTER_API_KEY),
    },
    {
      name: "OPENROUTER_RESEARCH_MODEL",
      requiredFor: "research model override",
      present: Boolean(process.env.OPENROUTER_RESEARCH_MODEL),
      optionalWhen: "OPENROUTER_DEFAULT_MODEL or code default is used",
    },
    {
      name: "LINEAR_API_KEY",
      requiredFor: "real Linear issue creation",
      present: Boolean(process.env.LINEAR_API_KEY),
    },
    {
      name: "LINEAR_TEAM_ID",
      requiredFor: "real Linear issue creation",
      present: Boolean(process.env.LINEAR_TEAM_ID),
    },
  ];

  return rows.map((row) => ({
    ...row,
    status: row.present ? "ready" : row.optionalWhen ? "optional" : "missing",
  }));
}

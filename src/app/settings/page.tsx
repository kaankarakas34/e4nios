import { AppShell } from "@/components/app-shell";

const envVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENROUTER_API_KEY",
  "OPENROUTER_DEFAULT_MODEL",
  "LINEAR_API_KEY",
  "LINEAR_TEAM_ID",
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          Configure environment variables in Vercel and local development.
        </p>
        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          {envVars.map((envVar) => (
            <div className="flex items-center justify-between border-b border-[#edf0ea] px-4 py-3 last:border-b-0" key={envVar}>
              <code className="text-sm">{envVar}</code>
              <span className="rounded-md bg-[#fff1d6] px-2 py-1 text-xs text-[#6b5424]">required</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

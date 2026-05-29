import { AppShell } from "@/components/app-shell";
import {
  listLinkedInAccounts,
  listKnowledgeItems,
  listPromptTemplates,
} from "@/lib/supabase/queries";

const envVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENROUTER_API_KEY",
  "OPENROUTER_DEFAULT_MODEL",
  "LINEAR_API_KEY",
  "LINEAR_TEAM_ID",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "LINKEDIN_REDIRECT_URI",
];

export default async function SettingsPage() {
  const [knowledgeItems, prompts, linkedInAccounts] = await Promise.all([
    listKnowledgeItems(),
    listPromptTemplates(),
    listLinkedInAccounts(),
  ]);

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
        <section className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#edf0ea] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">LinkedIn Connection</h2>
              <p className="mt-1 text-sm text-[#69746d]">
                Connects an account through official OAuth. This does not enable profile scraping or automated outreach.
              </p>
            </div>
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#1f6f5b] px-3 text-sm font-medium text-white"
              href="/api/linkedin/start"
            >
              Connect LinkedIn
            </a>
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {linkedInAccounts.length === 0 ? (
              <p className="p-4 text-sm text-[#69746d]">No LinkedIn account connected yet.</p>
            ) : (
              linkedInAccounts.map((account) => (
                <div className="p-4" key={String(account.id)}>
                  <p className="font-medium">{String(account.name ?? "LinkedIn account")}</p>
                  <p className="mt-1 text-sm text-[#69746d]">{String(account.email ?? "No email returned")}</p>
                </div>
              ))
            )}
          </div>
        </section>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-md border border-[#d8ded5] bg-white">
            <h2 className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">Prompt Library</h2>
            <div className="divide-y divide-[#edf0ea]">
              {prompts.map((prompt) => (
                <div className="p-4" key={String(prompt.id)}>
                  <p className="font-medium">{String(prompt.name)}</p>
                  <p className="mt-1 text-sm text-[#69746d]">{String(prompt.agent_type)} · v{String(prompt.version)}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-[#d8ded5] bg-white">
            <h2 className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">Knowledge Base</h2>
            <div className="divide-y divide-[#edf0ea]">
              {knowledgeItems.map((item) => (
                <div className="p-4" key={String(item.id)}>
                  <p className="font-medium">{String(item.title)}</p>
                  <p className="mt-1 text-sm text-[#69746d]">{String(item.category)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

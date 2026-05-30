import { AppShell } from "@/components/app-shell";
import {
  listLinkedInAccounts,
  listKnowledgeItems,
  listPromptTemplates,
} from "@/lib/supabase/queries";
import { envHealthRows, missingSupabaseAdminEnvVars } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [knowledgeItems, prompts, linkedInAccounts] = await Promise.all([
    listKnowledgeItems(),
    listPromptTemplates(),
    listLinkedInAccounts(),
  ]);
  const envRows = envHealthRows();
  const missingSupabase = missingSupabaseAdminEnvVars();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Configure environment variables in Vercel and local development.
        </p>
        {missingSupabase.length > 0 ? (
          <div className="mt-5 rounded-md border border-[#3f1d1d] bg-[#180707] p-3 text-sm text-[#fca5a5]">
            Supabase admin is not ready. Add {missingSupabase.join(", ")} in Vercel Production environment variables,
            then redeploy.
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-[#1f3f2b] bg-[#07180d] p-3 text-sm text-[#86efac]">
            Supabase admin is ready for server-side CRM writes.
          </div>
        )}
        <div className="mt-5 rounded-md border border-[#2a2a2a] bg-[#111111]">
          {envRows.map((envVar) => (
            <div
              className="grid gap-2 border-b border-[#242424] px-4 py-3 last:border-b-0 md:grid-cols-[1fr_1fr_96px]"
              key={envVar.name}
            >
              <code className="text-sm">{envVar.name}</code>
              <span className="text-sm text-[#a3a3a3]">{envVar.requiredFor}</span>
              <span
                className={
                  envVar.status === "ready"
                    ? "w-fit rounded-md bg-[#0f2a16] px-2 py-1 text-xs text-[#86efac]"
                    : envVar.status === "optional"
                      ? "w-fit rounded-md bg-[#171717] px-2 py-1 text-xs text-[#d4d4d4]"
                      : "w-fit rounded-md bg-[#2a0f0f] px-2 py-1 text-xs text-[#fca5a5]"
                }
              >
                {envVar.status}
              </span>
            </div>
          ))}
        </div>
        <section className="mt-5 rounded-md border border-[#2a2a2a] bg-[#111111]">
          <div className="flex flex-col gap-3 border-b border-[#242424] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">LinkedIn Connection</h2>
              <p className="mt-1 text-sm text-[#a3a3a3]">
                Connects an account through official OAuth. This does not enable profile scraping or automated outreach.
              </p>
            </div>
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#ef4444] px-3 text-sm font-medium text-white"
              href="/api/linkedin/start"
            >
              Connect LinkedIn
            </a>
          </div>
          <div className="divide-y divide-[#242424]">
            {linkedInAccounts.length === 0 ? (
              <p className="p-4 text-sm text-[#a3a3a3]">No LinkedIn account connected yet.</p>
            ) : (
              linkedInAccounts.map((account) => (
                <div className="p-4" key={String(account.id)}>
                  <p className="font-medium">{String(account.name ?? "LinkedIn account")}</p>
                  <p className="mt-1 text-sm text-[#a3a3a3]">{String(account.email ?? "No email returned")}</p>
                </div>
              ))
            )}
          </div>
        </section>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-md border border-[#2a2a2a] bg-[#111111]">
            <h2 className="border-b border-[#242424] px-4 py-3 text-sm font-semibold">Prompt Library</h2>
            <div className="divide-y divide-[#242424]">
              {prompts.map((prompt) => (
                <div className="p-4" key={String(prompt.id)}>
                  <p className="font-medium">{String(prompt.name)}</p>
                  <p className="mt-1 text-sm text-[#a3a3a3]">{String(prompt.agent_type)} · v{String(prompt.version)}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-[#2a2a2a] bg-[#111111]">
            <h2 className="border-b border-[#242424] px-4 py-3 text-sm font-semibold">Knowledge Base</h2>
            <div className="divide-y divide-[#242424]">
              {knowledgeItems.map((item) => (
                <div className="p-4" key={String(item.id)}>
                  <p className="font-medium">{String(item.title)}</p>
                  <p className="mt-1 text-sm text-[#a3a3a3]">{String(item.category)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

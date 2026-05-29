import { AppShell } from "@/components/app-shell";
import {
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
];

export default async function SettingsPage() {
  const [knowledgeItems, prompts] = await Promise.all([
    listKnowledgeItems(),
    listPromptTemplates(),
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

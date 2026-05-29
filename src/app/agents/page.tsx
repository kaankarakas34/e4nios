import { AppShell } from "@/components/app-shell";
import {
  actionCategories,
  researchAgents,
  researchSourceTypes,
  researchWorkflowSteps,
  type ResearchAgentLayer,
} from "@/lib/agents/research-workflow";
import { agentTaskStatuses } from "@/lib/domain";
import { listAgentTasks } from "@/lib/supabase/queries";

const layers: { id: ResearchAgentLayer; label: string }[] = [
  { id: "discovery", label: "Discovery" },
  { id: "intelligence", label: "Intelligence" },
  { id: "decision", label: "Decision" },
  { id: "action", label: "Action" },
];

export default async function AgentsPage() {
  const tasks = await listAgentTasks();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Agent Runs</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          Non-LinkedIn company-first research workflow, agent responsibilities, and live task status.
        </p>

        <section className="mt-5 rounded-md border border-[#d8ded5] bg-white p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1e2b23]">Research bot operating model</p>
              <p className="mt-1 max-w-3xl text-sm text-[#69746d]">
                LinkedIn is excluded from this workflow. The bot starts from a company pool, verifies the company,
                finds the decision maker, scores evidence confidence, then creates a human-approved next action.
              </p>
            </div>
            <span className="w-fit rounded-md bg-[#f1f5f0] px-2 py-1 text-xs font-medium text-[#34413a]">
              Company-first
            </span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {researchWorkflowSteps.map((step, index) => (
              <div className="rounded-md border border-[#edf0ea] bg-[#fbfcfa] p-3" key={step}>
                <p className="text-xs font-semibold uppercase text-[#69746d]">Step {index + 1}</p>
                <p className="mt-1 text-sm text-[#1e2b23]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {layers.map((layer) => (
              <div className="rounded-md border border-[#d8ded5] bg-white p-4" key={layer.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1e2b23]">{layer.label} agents</p>
                  <span className="rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">
                    {researchAgents.filter((agent) => agent.layer === layer.id).length}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {researchAgents
                    .filter((agent) => agent.layer === layer.id)
                    .map((agent) => (
                      <div className="rounded-md border border-[#edf0ea] p-3" key={agent.id}>
                        <p className="font-medium text-[#1e2b23]">{agent.name}</p>
                        <p className="mt-1 text-sm text-[#69746d]">{agent.purpose}</p>
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase text-[#69746d]">Writes to</p>
                          <p className="mt-1 text-xs text-[#34413a]">{agent.writesTo.join(", ")}</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase text-[#69746d]">Guardrails</p>
                          <p className="mt-1 text-xs text-[#34413a]">{agent.guardrails.join(" / ")}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-md border border-[#d8ded5] bg-white p-4">
              <p className="text-sm font-semibold text-[#1e2b23]">Allowed source types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {researchSourceTypes.map((source) => (
                  <span className="rounded-md bg-[#f1f5f0] px-2 py-1 text-xs text-[#34413a]" key={source}>
                    {source}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[#d8ded5] bg-white p-4">
              <p className="text-sm font-semibold text-[#1e2b23]">A1-A10 actions</p>
              <div className="mt-3 space-y-2">
                {actionCategories.map((action) => (
                  <div className="flex gap-2 text-sm" key={action.id}>
                    <span className="h-fit rounded-md bg-[#e4eee9] px-2 py-1 text-xs font-semibold text-[#1f6f5b]">
                      {action.id}
                    </span>
                    <span className="text-[#34413a]">{action.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {agentTaskStatuses.map((status) => (
            <div className="rounded-md border border-[#d8ded5] bg-white p-4" key={status}>
              <p className="text-xs uppercase text-[#69746d]">{status}</p>
              <p className="mt-2 text-2xl font-semibold">
                {tasks.filter((task) => task.status === status).length}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          {tasks.length === 0 ? (
            <p className="p-4 text-sm text-[#69746d]">No agent tasks yet.</p>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
              {tasks.map((task) => (
                <div className="grid gap-3 p-4 md:grid-cols-[1fr_140px_80px]" key={task.id}>
                  <div>
                    <p className="font-medium">{task.task_type}</p>
                    <p className="mt-1 text-xs text-[#69746d]">{task.id}</p>
                  </div>
                  <span className="w-fit rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">{task.status}</span>
                  <p className="text-sm text-[#34413a]">P{task.priority}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

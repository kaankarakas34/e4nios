import { AppShell } from "@/components/app-shell";
import { agentTaskStatuses } from "@/lib/domain";
import { listAgentTasks } from "@/lib/supabase/queries";

export default async function AgentsPage() {
  const tasks = await listAgentTasks();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Agent Runs</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          Every research, scoring, approach, communication, memory, and Linear task run is logged.
        </p>
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

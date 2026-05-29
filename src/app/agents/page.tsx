import { AppShell } from "@/components/app-shell";
import { agentTaskStatuses } from "@/lib/domain";

export default function AgentsPage() {
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
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

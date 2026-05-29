import { AppShell } from "@/components/app-shell";

const actions = ["Approve", "Needs More Research", "Move to Nurture", "Generate Message", "Create Linear Task"];

export default function ReviewPage() {
  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          AI recommendations wait here until the team approves the next action.
        </p>
        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white p-4">
          <p className="text-sm font-medium">No candidates waiting for review yet.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action) => (
              <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm" key={action} type="button">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

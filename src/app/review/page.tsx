import { AppShell } from "@/components/app-shell";
import {
  createLinearReviewTaskAction,
  updateCandidateReviewAction,
} from "@/app/actions";
import { listReviewCandidates } from "@/lib/supabase/queries";

export default async function ReviewPage() {
  const candidates = await listReviewCandidates();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          AI recommendations wait here until the team approves the next action.
        </p>
        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          {candidates.length === 0 ? (
            <p className="p-4 text-sm font-medium">No candidates waiting for review yet.</p>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
              {candidates.map((candidate) => (
                <div className="space-y-3 p-4" key={candidate.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">{candidate.full_name}</p>
                      <p className="mt-1 text-sm text-[#69746d]">
                        {candidate.title ?? "No title"} · {candidate.target_type} · Fit {candidate.fit_score ?? 0}
                      </p>
                      <p className="mt-2 text-sm text-[#34413a]">{candidate.next_best_action}</p>
                    </div>
                    <span className="w-fit rounded-md bg-[#fff1d6] px-2 py-1 text-xs text-[#6b5424]">
                      {candidate.review_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={updateCandidateReviewAction}>
                      <input name="id" type="hidden" value={candidate.id} />
                      <input name="review_status" type="hidden" value="approved" />
                      <input name="relationship_stage" type="hidden" value="approved" />
                      <button className="h-9 rounded-md bg-[#1f6f5b] px-3 text-sm text-white">Approve</button>
                    </form>
                    <form action={updateCandidateReviewAction}>
                      <input name="id" type="hidden" value={candidate.id} />
                      <input name="review_status" type="hidden" value="needs_more_research" />
                      <input name="relationship_stage" type="hidden" value="research_needed" />
                      <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm">Needs More Research</button>
                    </form>
                    <form action={updateCandidateReviewAction}>
                      <input name="id" type="hidden" value={candidate.id} />
                      <input name="review_status" type="hidden" value="nurture" />
                      <input name="relationship_stage" type="hidden" value="nurture_later" />
                      <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm">Move to Nurture</button>
                    </form>
                    <form action={createLinearReviewTaskAction}>
                      <input name="id" type="hidden" value={candidate.id} />
                      <input name="full_name" type="hidden" value={candidate.full_name} />
                      <input name="fit_score" type="hidden" value={candidate.fit_score ?? 0} />
                      <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm">Create Linear Task</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

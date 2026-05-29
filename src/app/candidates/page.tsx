import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { createCandidateAction } from "@/app/actions";
import { targetTypes } from "@/lib/domain";
import { listCandidates } from "@/lib/supabase/queries";

export default async function CandidatesPage() {
  const candidates = await listCandidates();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          Manual intake, LinkedIn manual data, scoring, and review routing start here.
        </p>
        <form action={createCandidateAction} className="mt-5 grid gap-4 rounded-md border border-[#d8ded5] bg-white p-4 md:grid-cols-2">
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="full_name" placeholder="Full name" required />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="company_name" placeholder="Company" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="title" placeholder="Title" />
          <select className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" defaultValue="member_candidate" name="target_type">
            {targetTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm md:col-span-2" name="linkedin_url" placeholder="LinkedIn URL" />
          <textarea className="min-h-28 rounded-md border border-[#cbd5cc] px-3 py-2 text-sm md:col-span-2" name="manual_linkedin" placeholder="Manual LinkedIn about, posts, comments, and observation notes" />
          <button className="h-10 rounded-md bg-[#1f6f5b] px-3 text-sm font-medium text-white md:w-fit" type="submit">
            Save and analyze
          </button>
        </form>

        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
            Candidate pipeline
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {candidates.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#69746d]">No candidates yet.</p>
            ) : (
              candidates.map((candidate) => (
                <div className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_120px_120px_160px_80px]" key={candidate.id}>
                  <div>
                    <p className="font-medium">{candidate.full_name}</p>
                    <p className="mt-1 text-sm text-[#69746d]">{candidate.title ?? "No title"} · {candidate.target_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#69746d]">Fit</p>
                    <p className="text-sm font-semibold">{candidate.fit_score ?? 0}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#69746d]">Review</p>
                    <p className="text-sm font-semibold">{candidate.review_status}</p>
                  </div>
                  <p className="text-sm text-[#34413a]">{candidate.next_best_action ?? "Review candidate"}</p>
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#cbd5cc] px-3 text-sm"
                    href={`/candidates/${candidate.id}`}
                  >
                    Open
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

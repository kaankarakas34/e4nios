import { AppShell } from "@/components/app-shell";
import { targetTypes } from "@/lib/domain";

export default function CandidatesPage() {
  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          Manual intake, LinkedIn manual data, scoring, and review routing start here.
        </p>
        <form className="mt-5 grid gap-4 rounded-md border border-[#d8ded5] bg-white p-4 md:grid-cols-2">
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" placeholder="Full name" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" placeholder="Company" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" placeholder="Title" />
          <select className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" defaultValue="member_candidate">
            {targetTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm md:col-span-2" placeholder="LinkedIn URL" />
          <textarea className="min-h-28 rounded-md border border-[#cbd5cc] px-3 py-2 text-sm md:col-span-2" placeholder="Manual LinkedIn about, posts, comments, and observation notes" />
          <button className="h-10 rounded-md bg-[#1f6f5b] px-3 text-sm font-medium text-white md:w-fit" type="button">
            Save draft candidate
          </button>
        </form>
      </div>
    </AppShell>
  );
}

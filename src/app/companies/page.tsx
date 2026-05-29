import { createCompanyAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { listCompanies } from "@/lib/supabase/queries";

export default async function CompaniesPage() {
  const companies = await listCompanies();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Company CRM</h1>
        <p className="mt-1 text-sm text-[#69746d]">
          Track sponsor, partner, member-company, and strategic account context.
        </p>

        <form action={createCompanyAction} className="mt-5 grid gap-4 rounded-md border border-[#d8ded5] bg-white p-4 md:grid-cols-3">
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="name" placeholder="Company name" required />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="website_url" placeholder="Website URL" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="industry" placeholder="Industry" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="city" placeholder="City" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="country" placeholder="Country" />
          <input className="h-10 rounded-md border border-[#cbd5cc] px-3 text-sm" name="company_size" placeholder="Company size" />
          <textarea className="min-h-24 rounded-md border border-[#cbd5cc] px-3 py-2 text-sm md:col-span-3" name="notes" placeholder="CRM notes, sponsor fit, relationship context" />
          <button className="h-10 rounded-md bg-[#1f6f5b] px-3 text-sm font-medium text-white md:w-fit" type="submit">
            Save company
          </button>
        </form>

        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
            Accounts
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {companies.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#69746d]">No companies yet.</p>
            ) : (
              companies.map((company) => (
                <article className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_160px_160px_1fr]" key={String(company.id)}>
                  <div>
                    <p className="font-medium">{String(company.name)}</p>
                    <p className="mt-1 text-sm text-[#69746d]">{String(company.website_url ?? "No website")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#69746d]">Industry</p>
                    <p className="text-sm font-semibold">{String(company.industry ?? "Unknown")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#69746d]">Location</p>
                    <p className="text-sm font-semibold">{String(company.city ?? "n/a")}</p>
                  </div>
                  <p className="text-sm text-[#34413a]">{String(company.notes ?? "No account notes yet.")}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import { createOrganizationAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { listOrganizations } from "@/lib/supabase/queries";

export default async function OrganizationsPage() {
  const organizations = await listOrganizations();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold">Organization CRM</h1>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Manage associations, chambers, technoparks, free zones, and ecosystem partners.
        </p>

        <form action={createOrganizationAction} className="mt-5 grid gap-4 rounded-md border border-[#2a2a2a] bg-[#111111] p-4 md:grid-cols-3">
          <input className="h-10 rounded-md border border-[#3a3a3a] px-3 text-sm" name="name" placeholder="Organization name" required />
          <select className="h-10 rounded-md border border-[#3a3a3a] px-3 text-sm" defaultValue="association" name="organization_type">
            <option value="association">association</option>
            <option value="technopark">technopark</option>
            <option value="chamber">chamber</option>
            <option value="free_zone">free_zone</option>
            <option value="startup_center">startup_center</option>
            <option value="other">other</option>
          </select>
          <input className="h-10 rounded-md border border-[#3a3a3a] px-3 text-sm" name="website_url" placeholder="Website URL" />
          <input className="h-10 rounded-md border border-[#3a3a3a] px-3 text-sm" name="city" placeholder="City" />
          <input className="h-10 rounded-md border border-[#3a3a3a] px-3 text-sm" name="country" placeholder="Country" />
          <textarea className="min-h-24 rounded-md border border-[#3a3a3a] px-3 py-2 text-sm md:col-span-3" name="notes" placeholder="Partner fit, member access, event collaboration notes" />
          <button className="h-10 rounded-md bg-[#ef4444] px-3 text-sm font-medium text-white md:w-fit" type="submit">
            Save organization
          </button>
        </form>

        <div className="mt-5 rounded-md border border-[#2a2a2a] bg-[#111111]">
          <div className="border-b border-[#242424] px-4 py-3 text-sm font-semibold">
            Partner ecosystem
          </div>
          <div className="divide-y divide-[#242424]">
            {organizations.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#a3a3a3]">No organizations yet.</p>
            ) : (
              organizations.map((organization) => (
                <article className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_160px_160px_1fr]" key={String(organization.id)}>
                  <div>
                    <p className="font-medium">{String(organization.name)}</p>
                    <p className="mt-1 text-sm text-[#a3a3a3]">{String(organization.website_url ?? "No website")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#a3a3a3]">Type</p>
                    <p className="text-sm font-semibold">{String(organization.organization_type ?? "other")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#a3a3a3]">Location</p>
                    <p className="text-sm font-semibold">{String(organization.city ?? "n/a")}</p>
                  </div>
                  <p className="text-sm text-[#d4d4d4]">{String(organization.notes ?? "No organization notes yet.")}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

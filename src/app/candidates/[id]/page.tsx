import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCandidateCrmProfile } from "@/lib/supabase/queries";

function field(value: unknown, fallback = "n/a") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function JsonBlock({ value }: { value: unknown }) {
  if (!value) return null;

  return (
    <pre className="max-h-72 overflow-auto rounded-md bg-[#f6f7f4] p-3 text-xs text-[#34413a]">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCandidateCrmProfile(id);

  if (!profile) {
    notFound();
  }

  const { person } = profile;

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-[#d8ded5] pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <Link className="text-sm text-[#1f6f5b] underline-offset-4 hover:underline" href="/candidates">
              Back to candidates
            </Link>
            <h1 className="mt-3 text-2xl font-semibold">{field(person.full_name)}</h1>
            <p className="mt-1 text-sm text-[#69746d]">
              {field(person.title, "No title")} · {field(person.target_type, "member_candidate")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-[#d8ded5] bg-white p-3">
              <p className="text-xs text-[#69746d]">Fit</p>
              <p className="text-lg font-semibold">{field(person.fit_score, "0")}</p>
            </div>
            <div className="rounded-md border border-[#d8ded5] bg-white p-3">
              <p className="text-xs text-[#69746d]">Risk</p>
              <p className="text-lg font-semibold">{field(person.risk_score, "0")}</p>
            </div>
            <div className="rounded-md border border-[#d8ded5] bg-white p-3">
              <p className="text-xs text-[#69746d]">Ready</p>
              <p className="text-lg font-semibold">{field(person.approach_readiness_score, "0")}</p>
            </div>
          </div>
        </div>

        <section className="grid gap-5 py-5 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-5">
            <div className="rounded-md border border-[#d8ded5] bg-white">
              <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
                CRM Summary
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-[#69746d]">Stage</p>
                  <p className="text-sm font-semibold">{field(person.relationship_stage)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#69746d]">Review</p>
                  <p className="text-sm font-semibold">{field(person.review_status)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#69746d]">City</p>
                  <p className="text-sm font-semibold">{field(person.city)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#69746d]">Source</p>
                  <p className="text-sm font-semibold">{field(person.source, "Manual")}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-[#69746d]">Next best action</p>
                  <p className="mt-1 text-sm text-[#34413a]">{field(person.next_best_action, "Review candidate")}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-[#69746d]">AI summary</p>
                  <p className="mt-1 text-sm text-[#34413a]">{field(person.ai_summary, "No summary yet.")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-[#d8ded5] bg-white">
              <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
                Intelligence Profile
              </div>
              <div className="space-y-3 p-4 text-sm text-[#34413a]">
                <p>{field(profile.intelligence?.profile_summary, "No intelligence profile yet.")}</p>
                <p>{field(profile.intelligence?.company_summary, "")}</p>
                <p>{field(profile.intelligence?.e4n_match_reason, "")}</p>
                <p className="rounded-md bg-[#fff8ea] p-3 text-[#6b5424]">
                  Red flags: {field(profile.intelligence?.red_flags, "No red flags recorded.")}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-[#d8ded5] bg-white">
              <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
                Score Breakdown
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {[
                  ["Network", profile.scores?.network_value_score],
                  ["Decision Power", profile.scores?.decision_power_score],
                  ["Referral", profile.scores?.referral_potential_score],
                  ["Engagement", profile.scores?.engagement_score],
                  ["Content", profile.scores?.content_alignment_score],
                  ["Commercial", profile.scores?.commercial_potential_score],
                  ["Trust", profile.scores?.trust_reputation_score],
                  ["Approach", profile.scores?.approach_readiness_score],
                ].map(([label, value]) => (
                  <div className="rounded-md border border-[#edf0ea] p-3" key={String(label)}>
                    <p className="text-xs text-[#69746d]">{label}</p>
                    <p className="text-sm font-semibold">{field(value, "0")}/100</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <JsonBlock value={profile.scores?.score_breakdown} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-md border border-[#d8ded5] bg-white">
              <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
                Approach Strategy
              </div>
              <div className="space-y-2 p-4 text-sm text-[#34413a]">
                <p>Stage: <strong>{field(profile.approach?.approach_stage)}</strong></p>
                <p>{field(profile.approach?.warm_signal_plan, "No warm signal plan yet.")}</p>
                <p>{field(profile.approach?.contextual_invite_plan, "")}</p>
              </div>
            </div>

            <div className="rounded-md border border-[#d8ded5] bg-white">
              <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
                Relationship Signals
              </div>
              <div className="divide-y divide-[#edf0ea]">
                {profile.signals.length === 0 ? (
                  <p className="p-4 text-sm text-[#69746d]">No signals yet.</p>
                ) : (
                  profile.signals.map((signal) => (
                    <article className="p-4" key={field(signal.id)}>
                      <p className="font-medium">{field(signal.title)}</p>
                      <p className="mt-1 text-sm text-[#34413a]">{field(signal.summary)}</p>
                      <p className="mt-2 text-xs text-[#69746d]">
                        {field(signal.source_type)} · confidence {field(signal.confidence_score)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-md border border-[#d8ded5] bg-white">
              <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
                Relationship Moves
              </div>
              <div className="divide-y divide-[#edf0ea]">
                {profile.moves.length === 0 ? (
                  <p className="p-4 text-sm text-[#69746d]">No moves yet.</p>
                ) : (
                  profile.moves.map((move) => (
                    <article className="p-4" key={field(move.id)}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{field(move.title)}</p>
                        <span className="rounded-md bg-[#fff1d6] px-2 py-1 text-xs text-[#6b5424]">
                          {field(move.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#34413a]">{field(move.body, "")}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-5 xl:grid-cols-3">
          <CrmList title="Message Drafts" items={profile.messages} primary="message_type" secondary="body" />
          <CrmList title="Agent Tasks" items={profile.tasks} primary="task_type" secondary="status" />
          <CrmList title="Linear Tasks" items={profile.linearTasks} primary="title" secondary="status" />
        </section>
      </div>
    </AppShell>
  );
}

function CrmList({
  title,
  items,
  primary,
  secondary,
}: {
  title: string;
  items: Record<string, unknown>[];
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-md border border-[#d8ded5] bg-white">
      <div className="border-b border-[#edf0ea] px-4 py-3 text-sm font-semibold">
        {title}
      </div>
      <div className="divide-y divide-[#edf0ea]">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-[#69746d]">No records yet.</p>
        ) : (
          items.map((item) => (
            <article className="p-4" key={field(item.id)}>
              <p className="text-sm font-medium">{field(item[primary])}</p>
              <p className="mt-1 line-clamp-3 text-sm text-[#69746d]">{field(item[secondary], "")}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

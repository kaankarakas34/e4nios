import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Send,
  ShieldCheck,
  Signal,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { safetyRules, type CandidateSummary } from "@/lib/domain";
import { getDashboardMetrics, listCandidates } from "@/lib/supabase/queries";

export default async function Home() {
  const [dashboardMetrics, candidates] = await Promise.all([
    getDashboardMetrics(),
    listCandidates(),
  ]);
  const metrics = [
    {
      label: "Total candidates",
      value: String(dashboardMetrics.candidates),
      icon: Users,
      tone: "bg-[#e4eee9]",
    },
    {
      label: "Review queue",
      value: String(dashboardMetrics.review),
      icon: Clock3,
      tone: "bg-[#fff1d6]",
    },
    {
      label: "Fit 85+",
      value: String(dashboardMetrics.fit85),
      icon: CheckCircle2,
      tone: "bg-[#e7f3ff]",
    },
    {
      label: "Draft messages",
      value: String(dashboardMetrics.messages),
      icon: MessageSquareText,
      tone: "bg-[#f9e5e5]",
    },
    {
      label: "Relationship signals",
      value: String(dashboardMetrics.signals),
      icon: Signal,
      tone: "bg-[#eef1ff]",
    },
    {
      label: "Pending moves",
      value: String(dashboardMetrics.pendingMoves),
      icon: Send,
      tone: "bg-[#e9f6f0]",
    },
  ];
  const candidateRows: CandidateSummary[] =
    candidates.length > 0
      ? candidates.slice(0, 5).map((candidate) => ({
          id: candidate.id,
          fullName: candidate.full_name,
          company: candidate.industry ?? "E4N pipeline",
          title: candidate.title ?? "No title",
          targetType: candidate.target_type ?? "member_candidate",
          stage: candidate.relationship_stage ?? "discovered",
          fitScore: candidate.fit_score ?? 0,
          riskScore: candidate.risk_score ?? 0,
          nextBestAction:
            candidate.next_best_action ??
            "Review candidate and complete missing context.",
          source: candidate.source ?? "Manual",
        }))
      : [
          {
            id: "empty",
            fullName: "Manual intake ready",
            company: "Fresh Supabase schema",
            title: "Core loop",
            targetType: "member_candidate",
            stage: "discovered",
            fitScore: 0,
            riskScore: 0,
            nextBestAction: "Add first candidate, then run AI analysis.",
            source: "MVP",
          },
        ];

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d8ded5] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f6f5b]">E4N Relationship Brain</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#17201c]">
              Relationship intelligence cockpit
            </h1>
          </div>
          <div className="flex gap-2">
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd5cc] bg-white px-3 text-sm font-medium"
              href="/candidates"
            >
              <Users className="size-4" />
              Candidates
            </a>
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f6f5b] px-3 text-sm font-medium text-white"
              href="/review"
            >
              <Sparkles className="size-4" />
              Review Queue
            </a>
          </div>
        </header>

        <section className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-6">
          {metrics.map((metric) => (
            <div className="rounded-md border border-[#d8ded5] bg-white p-4" key={metric.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#69746d]">{metric.label}</span>
                <span className={`grid size-8 place-items-center rounded-md ${metric.tone}`}>
                  <metric.icon className="size-4" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-md border border-[#d8ded5] bg-white">
            <div className="flex items-center justify-between border-b border-[#e3e7df] px-4 py-3">
              <h2 className="text-sm font-semibold">Core loop status</h2>
              <span className="rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">
                Supabase fresh
              </span>
            </div>
            <div className="divide-y divide-[#edf0ea]">
              {candidateRows.map((candidate) => (
                <div className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_120px_120px_160px]" key={candidate.id}>
                  <div>
                    <p className="font-medium">{candidate.fullName}</p>
                    <p className="mt-1 text-sm text-[#69746d]">
                      {candidate.title} at {candidate.company}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#69746d]">Fit</p>
                    <p className="text-sm font-semibold">{candidate.fitScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#69746d]">Risk</p>
                    <p className="text-sm font-semibold">{candidate.riskScore}/100</p>
                  </div>
                  <div className="text-sm text-[#34413a]">{candidate.nextBestAction}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[#d8ded5] bg-white">
            <div className="border-b border-[#e3e7df] px-4 py-3">
              <h2 className="text-sm font-semibold">Safety policy</h2>
            </div>
            <div className="space-y-3 p-4">
              {safetyRules.map((rule) => (
                <div className="flex items-center gap-3 text-sm" key={rule}>
                  <ShieldCheck className="size-4 text-[#1f6f5b]" />
                  {rule}
                </div>
              ))}
              <div className="mt-4 rounded-md border border-[#e6d2ad] bg-[#fff8ea] p-3 text-sm text-[#6b5424]">
                <div className="flex gap-2">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>Outbound communication is draft-only until a human approves it.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-md border border-[#d8ded5] bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Implementation runway</h2>
              <p className="mt-1 text-sm text-[#69746d]">
                Linear project and Supabase schema are ready. Next step is wiring authenticated CRUD and the orchestrator.
              </p>
            </div>
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd5cc] px-3 text-sm font-medium"
              href="https://linear.app/e4n/project/e4n-relationship-brain-mvp-bd0dfc26240f"
              rel="noreferrer"
              target="_blank"
            >
              Linear project
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

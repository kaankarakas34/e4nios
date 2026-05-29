import type {
  ApproachStrategyResult,
  IntelligenceProfileResult,
  MessageDraftResult,
  ScoringResult,
} from "@/lib/agents/contracts";
import type { TargetType } from "@/lib/domain";

type CandidateInput = {
  fullName: string;
  company?: string;
  title?: string;
  targetType: TargetType;
  manualLinkedin?: string;
};

function clamp(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function scoreCandidate(input: CandidateInput): ScoringResult {
  const title = input.title?.toLowerCase() ?? "";
  const manualContext = input.manualLinkedin?.trim() ?? "";
  const decisionBoost = /(founder|kurucu|ceo|genel müdür|director|partner|c-level|cto|cfo|cmo)/i.test(title)
    ? 22
    : 10;
  const targetBoost =
    input.targetType === "sponsor_candidate" || input.targetType === "partner_candidate"
      ? 16
      : 12;
  const contextBoost = manualContext.length > 80 ? 18 : manualContext.length > 0 ? 10 : 4;
  const fit = clamp(42 + decisionBoost + targetBoost + contextBoost);

  return {
    fit_score: fit,
    network_value_score: clamp(fit - 4),
    decision_power_score: clamp(50 + decisionBoost * 2),
    referral_potential_score: clamp(fit - 8),
    engagement_score: clamp(contextBoost * 4),
    content_alignment_score: clamp(45 + contextBoost * 2),
    commercial_potential_score: clamp(input.targetType === "sponsor_candidate" ? fit + 8 : fit - 3),
    trust_reputation_score: clamp(52 + decisionBoost),
    risk_score: manualContext.length > 0 ? 18 : 34,
    approach_readiness_score: manualContext.length > 0 ? clamp(fit - 5) : 52,
    explanation:
      "MVP fallback scoring used available title, target type, and manual LinkedIn context. Replace with OpenRouter scoring when API key is configured.",
    score_breakdown: {
      decision_power: "Title and seniority signals were used for decision power.",
      context_quality: "Manual LinkedIn/user observation data raises confidence and readiness.",
      safety: "Risk remains conservative until sources and manual review are complete.",
    },
  };
}

export function buildIntelligenceProfile(
  input: CandidateInput,
  score: ScoringResult,
): IntelligenceProfileResult {
  return {
    profile_summary: `${input.fullName} was added as a ${input.targetType.replaceAll("_", " ")} candidate for E4N review.`,
    company_summary: input.company
      ? `${input.company} should be evaluated for E4N relationship, referral, partner, or commercial fit.`
      : "Company context is missing and should be enriched before high-confidence outreach.",
    linkedin_analysis: input.manualLinkedin
      ? "Manual LinkedIn input is available and was used as context."
      : "Manual LinkedIn input is missing; no scraping was performed.",
    content_analysis: "MVP fallback analysis created a conservative content alignment estimate.",
    reputation_signals: "Decision power and public role signals should be verified with source links.",
    red_flags: score.risk_score > 30 ? "Limited context creates uncertainty; request more research." : "No immediate red flags from provided data.",
    mutual_connection_strategy: "Check E4N members for warm introduction paths before direct outreach.",
    e4n_match_reason: "Candidate may fit E4N if they can create trusted B2B value, referrals, partnership, or sponsorship potential.",
    recommended_target_type: input.targetType,
    recommended_approach: "Start with review, then choose warm signal or contextual invite based on available context.",
    source_confidence_score: input.manualLinkedin ? 68 : 42,
  };
}

export function buildApproachStrategy(score: ScoringResult): ApproachStrategyResult {
  const direct = score.approach_readiness_score >= 78 && score.risk_score <= 25;

  return {
    approach_stage: direct ? "soft_touch" : "warm_signal",
    approach_type: direct ? "contextual_soft_intro" : "warm_before_invite",
    should_direct_message: direct,
    warm_up_required: !direct,
    observe_notes: "Review recent activity and source links before any external communication.",
    warm_signal_plan: "Prefer a meaningful comment, shared context, or mutual connection before pitching E4N.",
    soft_touch_plan: "Use a short, selective, relationship-first note. Do not sell membership in the first sentence.",
    contextual_invite_plan: "Invite around a specific E4N meeting, business theme, sponsor fit, or partner opportunity.",
    follow_up_plan: "If no answer, wait 3-5 business days and send one soft follow-up.",
    nurture_plan: "If timing or fit is uncertain, move to nurture with a future research reminder.",
    risk_notes: "No automatic LinkedIn, WhatsApp, or email sending is allowed in V1.",
  };
}

export function buildMessageDrafts(input: CandidateInput): MessageDraftResult {
  return {
    drafts: [
      {
        channel: "linkedin",
        message_type: "connection",
        body: `Merhaba ${input.fullName}, E4N tarafında seçici ve güvene dayalı iş insanları ağı kapsamında profilinizi not aldık. Uygun bir bağlamda tanışmak isterim.`,
      },
      {
        channel: "email",
        message_type: "contextual_invite",
        subject: "E4N kapsamında tanışma",
        body: `Merhaba ${input.fullName},\n\nE4N'de güvene dayalı iş bağlantıları, referans ve iş birliği potansiyeli yüksek profesyonelleri seçici gruplarda bir araya getiriyoruz. Sizinle doğru bağlamda kısa bir tanışma yapmak isteriz.\n\nNot: Bu mesaj taslaktır ve insan onayı olmadan gönderilmemelidir.`,
      },
    ],
  };
}

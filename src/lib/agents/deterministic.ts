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
  const decisionBoost = /(founder|kurucu|ceo|genel mudur|genel müdür|director|partner|c-level|cto|cfo|cmo)/i.test(
    title,
  )
    ? 22
    : 10;
  const targetBoost =
    input.targetType === "sponsor_candidate" || input.targetType === "partner_candidate"
      ? 16
      : 12;
  const contextBoost = manualContext.length > 80 ? 18 : manualContext.length > 0 ? 10 : 4;
  const fit = clamp(42 + decisionBoost + targetBoost + contextBoost);
  const companyRealityScore = input.company ? clamp(12 + Math.round(contextBoost / 2)) : 7;
  const decisionMakerScore = clamp(Math.round((50 + decisionBoost * 2) / 5));
  const commercialActivityScore = clamp(input.targetType === "sponsor_candidate" ? 15 : 11);
  const networkPotentialScore = clamp(Math.round((fit - 12) / 7));
  const e4nFitScore = clamp(Math.round((fit - 10) / 6));
  const visibilityScore = manualContext.length > 0 ? 3 : 1;
  const dataConfidenceScore = input.company && manualContext.length > 80 ? 64 : input.company ? 48 : 34;
  const actionCategory = fit >= 85 ? "A2" : input.company ? "A8" : "A10";

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
      "MVP fallback scoring used available role, company, target type, and user-provided research context. Replace with OpenRouter scoring when API key is configured.",
    score_breakdown: {
      decision_power: "Title and seniority signals were used for decision power.",
      company_first_research: "Company context is treated as the first gate before person-level qualification.",
      context_quality: "User-provided public research notes raise confidence and readiness.",
      safety: "Risk remains conservative until non-LinkedIn source links and manual review are complete.",
    },
    e4n_research_breakdown: {
      company_reality_score: companyRealityScore,
      decision_maker_score: decisionMakerScore,
      commercial_activity_score: commercialActivityScore,
      network_potential_score: networkPotentialScore,
      e4n_fit_score: e4nFitScore,
      visibility_score: visibilityScore,
      data_confidence_score: dataConfidenceScore,
      action_category: actionCategory,
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
      ? "LinkedIn is handled outside this research workflow. The provided text is treated only as user-supplied context, not scraped data."
      : "LinkedIn is excluded from this research workflow and no LinkedIn collection was performed.",
    non_linkedin_research_plan:
      "Start with company pool sources such as fair exhibitor lists, event pages, chambers, sector directories, Maps/local business listings, official lists, dealer networks, and associations. Then verify the decision maker through non-LinkedIn sources.",
    content_analysis: "MVP fallback analysis created a conservative non-LinkedIn content alignment estimate.",
    reputation_signals: "Decision power and public role signals should be verified with source links.",
    red_flags:
      score.risk_score > 30
        ? "Limited context creates uncertainty; request more research."
        : "No immediate red flags from provided data.",
    mutual_connection_strategy: "Check E4N members for warm introduction paths before direct outreach.",
    e4n_match_reason:
      "Candidate may fit E4N if they can create trusted B2B value, referrals, partnership, or sponsorship potential.",
    recommended_target_type: input.targetType,
    recommended_approach:
      "Start with company verification, then decision-maker validation, then choose warm signal or contextual invite based on evidence confidence.",
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
    warm_signal_plan:
      "Prefer a source-backed shared context, event reference, company signal, or mutual introduction before pitching E4N.",
    soft_touch_plan: "Use a short, selective, relationship-first note. Do not sell membership in the first sentence.",
    contextual_invite_plan: "Invite around a specific E4N meeting, business theme, sponsor fit, or partner opportunity.",
    follow_up_plan: "If no answer, wait 3-5 business days and send one soft follow-up.",
    nurture_plan: "If timing or fit is uncertain, move to nurture with a future research reminder.",
    risk_notes:
      "No LinkedIn research automation runs in this workflow. No automatic WhatsApp or email sending is allowed in V1.",
  };
}

export function buildMessageDrafts(input: CandidateInput): MessageDraftResult {
  return {
    drafts: [
      {
        channel: "internal_note",
        message_type: "first_touch_note",
        body: `${input.fullName} icin ilk temas LinkedIn otomasyonu olmadan planlanmali. Once sirket gercekligi, karar verici baglantisi ve kaynak guveni kontrol edilsin; sonra E4N baglamina gore manuel davet taslagi onaya sunulsun.`,
      },
      {
        channel: "email",
        message_type: "contextual_invite",
        subject: "E4N kapsaminda tanisma",
        body: `Merhaba ${input.fullName},\n\nE4N'de guvene dayali is baglantilari, referans ve is birligi potansiyeli yuksek profesyonelleri secici gruplarda bir araya getiriyoruz. Sizinle dogru baglamda kisa bir tanisma yapmak isteriz.\n\nNot: Bu mesaj taslaktir ve insan onayi olmadan gonderilmemelidir.`,
      },
    ],
  };
}

export function buildRelationshipSignal(input: CandidateInput) {
  const hasManualContext = Boolean(input.manualLinkedin?.trim());

  return {
    signal_type: hasManualContext ? "manual_research_context" : "manual_candidate_intake",
    source_type: hasManualContext ? "manual_research_input" : "manual_input",
    title: hasManualContext
      ? `${input.fullName} has manual research context`
      : `${input.fullName} was added manually`,
    summary: hasManualContext
      ? "User-provided public research context is available for relationship analysis. LinkedIn collection is outside this workflow."
      : "Candidate was added without rich context. Treat this as a low-confidence intake signal until source links or manual notes are added.",
    confidence_score: hasManualContext ? 68 : 42,
    status: "linked_to_candidate" as const,
    metadata: {
      target_type: input.targetType,
      company: input.company ?? null,
      privacy_note: "Manual user input; do not infer private contact details.",
    },
  };
}

export function buildRelationshipMoves(input: CandidateInput, score: ScoringResult) {
  const directReady = score.approach_readiness_score >= 78 && score.risk_score <= 25;

  const firstMove = directReady
    ? {
        move_type: "soft_touch",
        channel: "manual",
        stage: "soft_touch",
        title: `Approve soft-touch intro for ${input.fullName}`,
        body: "Review company and person evidence, then approve a short relationship-first intro. Do not pitch membership directly.",
      }
    : {
        move_type: "warm_signal",
        channel: "manual",
        stage: "warm_signal",
        title: `Find warm signal for ${input.fullName}`,
        body: "Look for a recent public source, shared context, event, or mutual connection before any direct invite.",
      };

  return [
    {
      ...firstMove,
      status: "pending_approval" as const,
      metadata: {
        generated_by: "deterministic_mvp_fallback",
        reason: directReady
          ? "Approach readiness is high and risk is low."
          : "Context or confidence is not strong enough for direct outreach.",
      },
    },
    {
      move_type: "nurture_check",
      channel: "internal",
      stage: "nurture",
      title: `Schedule nurture check for ${input.fullName}`,
      body: "If the team does not approve immediate action, revisit this candidate after more context is available.",
      status: "pending_approval" as const,
      metadata: {
        generated_by: "deterministic_mvp_fallback",
        reason: "Every candidate should have a safe next relationship path, even when outreach is not ready.",
      },
    },
  ];
}

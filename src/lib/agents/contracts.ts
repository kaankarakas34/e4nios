import { TargetType } from "@/lib/domain";

export type ScoringResult = {
  fit_score: number;
  network_value_score: number;
  decision_power_score: number;
  referral_potential_score: number;
  engagement_score: number;
  content_alignment_score: number;
  commercial_potential_score: number;
  trust_reputation_score: number;
  risk_score: number;
  approach_readiness_score: number;
  explanation: string;
  score_breakdown: Record<string, string>;
};

export type ApproachStrategyResult = {
  approach_stage:
    | "observe"
    | "warm_signal"
    | "soft_touch"
    | "contextual_invite"
    | "follow_up"
    | "nurture";
  approach_type: string;
  should_direct_message: boolean;
  warm_up_required: boolean;
  observe_notes: string;
  warm_signal_plan: string;
  soft_touch_plan: string;
  contextual_invite_plan: string;
  follow_up_plan: string;
  nurture_plan: string;
  risk_notes: string;
};

export type IntelligenceProfileResult = {
  profile_summary: string;
  company_summary: string;
  linkedin_analysis: string;
  content_analysis: string;
  reputation_signals: string;
  red_flags: string;
  mutual_connection_strategy: string;
  e4n_match_reason: string;
  recommended_target_type: TargetType;
  recommended_approach: string;
  source_confidence_score: number;
};

export type MessageDraftResult = {
  drafts: Array<{
    channel: "linkedin" | "email" | "internal_note";
    message_type: string;
    subject?: string;
    body: string;
  }>;
};

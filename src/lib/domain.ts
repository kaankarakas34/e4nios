export const targetTypes = [
  "member_candidate",
  "sponsor_candidate",
  "partner_candidate",
  "speaker_candidate",
  "c_level_guest",
  "white_collar_guest",
  "investor",
  "association",
  "technopark",
  "chamber",
  "free_zone",
  "other",
] as const;

export const relationshipStages = [
  "discovered",
  "research_needed",
  "qualified",
  "to_review",
  "approved",
  "contacted",
  "responded",
  "meeting_scheduled",
  "attended",
  "intent_form_sent",
  "intent_form_submitted",
  "interview_done",
  "member_candidate",
  "member",
  "partner",
  "sponsor",
  "rejected",
  "nurture_later",
] as const;

export const agentTaskStatuses = [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
  "waiting_for_human_input",
] as const;

export const messageStatuses = [
  "draft",
  "waiting_approval",
  "approved",
  "rejected",
  "needs_edit",
  "sent_manually",
  "sent_by_email",
] as const;

export type TargetType = (typeof targetTypes)[number];
export type RelationshipStage = (typeof relationshipStages)[number];
export type AgentTaskStatus = (typeof agentTaskStatuses)[number];
export type MessageStatus = (typeof messageStatuses)[number];

export type CandidateSummary = {
  id: string;
  fullName: string;
  company: string;
  title: string;
  targetType: TargetType;
  stage: RelationshipStage;
  fitScore: number;
  riskScore: number;
  nextBestAction: string;
  source: string;
};

export const safetyRules = [
  "LinkedIn scraping disabled",
  "LinkedIn DM disabled",
  "WhatsApp auto-send disabled",
  "Email auto-send disabled",
  "Human approval required",
] as const;

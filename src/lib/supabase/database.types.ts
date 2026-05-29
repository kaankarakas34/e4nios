export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      people: {
        Row: {
          id: string;
          full_name: string;
          title: string | null;
          industry: string | null;
          city: string | null;
          linkedin_url: string | null;
          source: string | null;
          target_type: Database["public"]["Enums"]["target_type"] | null;
          relationship_stage:
            | Database["public"]["Enums"]["relationship_stage"]
            | null;
          review_status: Database["public"]["Enums"]["review_status"] | null;
          fit_score: number | null;
          risk_score: number | null;
          approach_readiness_score: number | null;
          ai_summary: string | null;
          next_best_action: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          title?: string | null;
          industry?: string | null;
          city?: string | null;
          linkedin_url?: string | null;
          source?: string | null;
          target_type?: Database["public"]["Enums"]["target_type"] | null;
          relationship_stage?:
            | Database["public"]["Enums"]["relationship_stage"]
            | null;
          review_status?: Database["public"]["Enums"]["review_status"] | null;
          fit_score?: number | null;
          risk_score?: number | null;
          approach_readiness_score?: number | null;
          ai_summary?: string | null;
          next_best_action?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["people"]["Insert"]>;
      };
      agent_tasks: {
        Row: {
          id: string;
          task_type: string;
          status: Database["public"]["Enums"]["agent_task_status"] | null;
          priority: number | null;
          person_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          task_type: string;
          status?: Database["public"]["Enums"]["agent_task_status"] | null;
          priority?: number | null;
          person_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["agent_tasks"]["Insert"]>;
      };
      message_drafts: {
        Row: {
          id: string;
          person_id: string | null;
          channel: string | null;
          message_type: string | null;
          subject: string | null;
          body: string;
          status: Database["public"]["Enums"]["message_status"] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          person_id?: string | null;
          channel?: string | null;
          message_type?: string | null;
          subject?: string | null;
          body: string;
          status?: Database["public"]["Enums"]["message_status"] | null;
        };
        Update: Partial<Database["public"]["Tables"]["message_drafts"]["Insert"]>;
      };
      prompt_templates: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      knowledge_base_items: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      agent_runs: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      companies: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      organizations: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      linear_tasks: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      target_type:
        | "member_candidate"
        | "sponsor_candidate"
        | "partner_candidate"
        | "speaker_candidate"
        | "c_level_guest"
        | "white_collar_guest"
        | "investor"
        | "association"
        | "technopark"
        | "chamber"
        | "free_zone"
        | "other";
      relationship_stage:
        | "discovered"
        | "research_needed"
        | "qualified"
        | "to_review"
        | "approved"
        | "contacted"
        | "responded"
        | "meeting_scheduled"
        | "attended"
        | "intent_form_sent"
        | "intent_form_submitted"
        | "interview_done"
        | "member_candidate"
        | "member"
        | "partner"
        | "sponsor"
        | "rejected"
        | "nurture_later";
      review_status:
        | "new"
        | "to_review"
        | "approved"
        | "rejected"
        | "needs_more_research"
        | "nurture";
      agent_task_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
        | "waiting_for_human_input";
      message_status:
        | "draft"
        | "waiting_approval"
        | "approved"
        | "rejected"
        | "needs_edit"
        | "sent_manually"
        | "sent_by_email";
    };
    CompositeTypes: Record<string, never>;
  };
};

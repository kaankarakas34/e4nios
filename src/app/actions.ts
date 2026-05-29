"use server";

import { revalidatePath } from "next/cache";

import {
  buildApproachStrategy,
  buildIntelligenceProfile,
  buildMessageDrafts,
  scoreCandidate,
} from "@/lib/agents/deterministic";
import { targetTypes, type TargetType } from "@/lib/domain";
import { createAdminClient } from "@/lib/supabase/admin";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function targetTypeFromForm(formData: FormData): TargetType {
  const value = text(formData, "target_type");
  return targetTypes.includes(value as TargetType)
    ? (value as TargetType)
    : "member_candidate";
}

export async function createCandidateAction(formData: FormData) {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const fullName = text(formData, "full_name");
  const companyName = text(formData, "company_name");
  const title = text(formData, "title");
  const targetType = targetTypeFromForm(formData);
  const linkedinUrl = text(formData, "linkedin_url");
  const manualLinkedin = text(formData, "manual_linkedin");

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  let companyId: string | null = null;

  if (companyName) {
    const { data: company, error } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    companyId = String(company.id);
  }

  const score = scoreCandidate({
    fullName,
    company: companyName,
    title,
    targetType,
    manualLinkedin,
  });

  const { data: person, error: personError } = await supabase
    .from("people")
    .insert({
      full_name: fullName,
      company_id: companyId,
      title,
      linkedin_url: linkedinUrl,
      target_type: targetType,
      relationship_stage: "to_review",
      review_status: "to_review",
      fit_score: score.fit_score,
      risk_score: score.risk_score,
      approach_readiness_score: score.approach_readiness_score,
      ai_summary: score.explanation,
      next_best_action:
        score.approach_readiness_score >= 78
          ? "Review and approve contextual soft-touch."
          : "Warm signal or more research before direct outreach.",
    })
    .select("id")
    .single();

  if (personError) {
    throw personError;
  }

  const personId = String(person.id);
  const profile = buildIntelligenceProfile(
    { fullName, company: companyName, title, targetType, manualLinkedin },
    score,
  );
  const approach = buildApproachStrategy(score);
  const messages = buildMessageDrafts({ fullName, company: companyName, title, targetType, manualLinkedin });

  const taskInserts = [
    "generate_fit_score",
    "generate_approach_strategy",
    "generate_message",
    "update_memory",
  ].map((task_type) => ({
    task_type,
    status: "completed" as const,
    priority: score.fit_score >= 85 ? 2 : 5,
    person_id: personId,
    input_json: { person_id: personId },
    output_json: { generated_by: "deterministic_mvp_fallback" },
    executed_at: new Date().toISOString(),
  }));

  const { data: tasks } = await supabase
    .from("agent_tasks")
    .insert(taskInserts)
    .select("id, task_type");

  await Promise.all([
    supabase.from("fit_scores").insert({
      person_id: personId,
      ...score,
    }),
    supabase.from("candidate_intelligence_profiles").insert({
      person_id: personId,
      ...profile,
    }),
    supabase.from("approach_strategies").insert({
      person_id: personId,
      ...approach,
    }),
    supabase.from("message_drafts").insert(
      messages.drafts.map((draft) => ({
        person_id: personId,
        channel: draft.channel,
        message_type: draft.message_type,
        subject: draft.subject ?? null,
        body: draft.body,
        status: "draft" as const,
      })),
    ),
    supabase.from("agent_runs").insert(
      (tasks ?? []).map((task) => ({
        agent_name: task.task_type,
        task_id: task.id,
        model_provider: "local",
        model_name: "deterministic_mvp_fallback",
        input_json: { person_id: personId },
        output_json: { score, approach, messages },
        status: "completed",
      })),
    ),
  ]);

  revalidatePath("/");
  revalidatePath("/candidates");
  revalidatePath("/review");
  revalidatePath("/messages");
  revalidatePath("/agents");
}

export async function updateCandidateReviewAction(formData: FormData) {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const id = text(formData, "id");
  const reviewStatus = text(formData, "review_status");
  const relationshipStage = text(formData, "relationship_stage");

  const { error } = await supabase
    .from("people")
    .update({
      review_status: reviewStatus,
      relationship_stage: relationshipStage,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/candidates");
  revalidatePath("/review");
}

export async function createLinearReviewTaskAction(formData: FormData) {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const personId = text(formData, "id");
  const fullName = text(formData, "full_name");
  const fitScore = text(formData, "fit_score");
  const title = `Review high-priority candidate: ${fullName}`;
  const description = `Fit Score: ${fitScore || "n/a"}\nSuggested Action: Human review required before outbound communication.\nReason: Candidate is in E4N Relationship Brain review queue.`;
  let linearIssueId: string | null = null;
  let linearIssueUrl: string | null = null;

  if (process.env.LINEAR_API_KEY && process.env.LINEAR_TEAM_ID) {
    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: process.env.LINEAR_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                identifier
                url
              }
            }
          }
        `,
        variables: {
          input: {
            teamId: process.env.LINEAR_TEAM_ID,
            projectId: process.env.LINEAR_PROJECT_ID || undefined,
            title,
            description,
            priority: 2,
          },
        },
      }),
    });

    if (response.ok) {
      const payload = await response.json();
      linearIssueId =
        payload.data?.issueCreate?.issue?.identifier ??
        payload.data?.issueCreate?.issue?.id ??
        null;
      linearIssueUrl = payload.data?.issueCreate?.issue?.url ?? null;
    }
  }

  await supabase.from("linear_tasks").insert({
    related_person_id: personId,
    linear_issue_id: linearIssueId,
    linear_issue_url: linearIssueUrl,
    title,
    description,
    task_type: "high_priority_candidate_review",
    status: linearIssueId ? "created_in_linear" : "created_locally",
  });

  revalidatePath("/review");
}

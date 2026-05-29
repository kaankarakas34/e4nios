import { describe, expect, it } from "vitest";

import {
  buildApproachStrategy,
  buildMessageDrafts,
  scoreCandidate,
} from "./deterministic";

describe("deterministic MVP agents", () => {
  it("scores senior candidates higher and keeps explanations", () => {
    const score = scoreCandidate({
      fullName: "Ada Topcu",
      company: "E4N",
      title: "Founder",
      targetType: "member_candidate",
      manualLinkedin:
        "B2B growth, trusted networking, partnerships, and founder activity.",
    });

    expect(score.fit_score).toBeGreaterThanOrEqual(70);
    expect(score.explanation).toContain("MVP fallback");
  });

  it("keeps outbound messages in the draft-only policy", () => {
    const drafts = buildMessageDrafts({
      fullName: "Kaan Karakas",
      targetType: "sponsor_candidate",
    });

    expect(drafts.drafts).toHaveLength(2);
    expect(drafts.drafts[1].body).toContain("Not:");
  });

  it("requires warm-up for low readiness candidates", () => {
    const strategy = buildApproachStrategy({
      fit_score: 55,
      network_value_score: 50,
      decision_power_score: 50,
      referral_potential_score: 50,
      engagement_score: 20,
      content_alignment_score: 45,
      commercial_potential_score: 50,
      trust_reputation_score: 50,
      risk_score: 40,
      approach_readiness_score: 45,
      explanation: "",
      score_breakdown: {},
    });

    expect(strategy.should_direct_message).toBe(false);
    expect(strategy.warm_up_required).toBe(true);
  });
});

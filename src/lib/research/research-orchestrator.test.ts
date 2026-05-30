import { describe, expect, it } from "vitest";

import { extractEntityFromSource } from "./entity-extractor";
import { normalizeProfiles } from "./profile-normalizer";
import { scoreProfile } from "./profile-scoring-engine";
import { generateSegments } from "./segment-generator";
import { generateSearchQueries } from "./search-query-generator";

describe("research orchestrator planning", () => {
  it("splits a broad finance startup prompt into segments instead of using the raw prompt as one search", () => {
    const prompt =
      "Finans profesyonelleri, venture capital sirketleri, yatirimcilar, girisimcilik ekosistemi ve fintech kuruculari";
    const segments = generateSegments(prompt);
    const queries = generateSearchQueries(segments);

    expect(segments.length).toBeGreaterThan(3);
    expect(segments.map((segment) => segment.name)).toContain("Venture capital partners");
    expect(queries.some((query) => query.query === prompt)).toBe(false);
    expect(queries.every((query) => query.engine === "google" || query.engine === "bing")).toBe(true);
  });

  it("generates expected template lanes for VC, fintech founder, and sponsor bank segments", () => {
    const segments = generateSegments("venture capital fintech banka sponsor Istanbul");
    const queries = generateSearchQueries(segments);
    const templateTypes = new Set(queries.map((query) => query.templateType));

    expect(templateTypes.has("investment_news")).toBe(true);
    expect(templateTypes.has("company_team_page")).toBe(true);
    expect(templateTypes.has("sponsor_candidate")).toBe(true);
    expect(templateTypes.has("podcast_interview")).toBe(true);
  });
});

describe("research entity normalization and scoring", () => {
  it("merges the same extracted person from different sources and increases evidence count", () => {
    const first = extractEntityFromSource({
      title: "Jane Founder - Fintech CEO interview",
      url: "https://example.com/interview",
      snippet: "Jane Founder is the founder and CEO of a fintech startup in Istanbul.",
    });
    const second = { ...first, profileUrl: "https://news.example.com/jane", context: "Investment news mention" };
    const profiles = normalizeProfiles([first, second]);

    expect(profiles).toHaveLength(1);
    expect(profiles[0].evidenceCount).toBe(2);
  });

  it("weights decision power, ecosystem relevance, and evidence count in the score", () => {
    const score = scoreProfile({
      normalizedName: "Jane Founder",
      normalizedCompany: "FintechCo",
      title: "founder",
      category: "uye adayi",
      summary: "Founder and CEO in fintech startup ecosystem with podcast and investment news visibility.",
      evidenceCount: 3,
      entities: [],
    });

    expect(score.finalScore).toBeGreaterThanOrEqual(75);
    expect(score.scoreBreakdown.decision_power).toBeGreaterThanOrEqual(18);
    expect(score.category).toMatch(/yatirimci|uye|konusmaci/);
  });
});

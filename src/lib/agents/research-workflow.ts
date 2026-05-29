export type ResearchAgentLayer = "discovery" | "intelligence" | "decision" | "action";

export type ResearchAgentDefinition = {
  id: string;
  name: string;
  layer: ResearchAgentLayer;
  purpose: string;
  writesTo: string[];
  outputContract: string[];
  guardrails: string[];
};

export const researchAgents: ResearchAgentDefinition[] = [
  {
    id: "source_discovery_agent",
    name: "Source Discovery Agent",
    layer: "discovery",
    purpose:
      "Builds non-LinkedIn source queries for the target segment and decides which source types should be checked first.",
    writesTo: ["research_tasks", "agent_tasks", "agent_runs"],
    outputContract: ["source_type", "query", "target_segment", "priority", "why_this_source"],
    guardrails: ["Never uses LinkedIn", "Creates source tasks only; does not qualify people"],
  },
  {
    id: "company_extraction_agent",
    name: "Company Extraction Agent",
    layer: "discovery",
    purpose:
      "Extracts a company pool from fairs, events, chambers, directories, Maps/local listings, dealer lists, and association pages.",
    writesTo: ["research_results", "companies", "source_links", "agent_runs"],
    outputContract: ["company_name", "website_url", "city", "sector", "source_url", "duplicate_key"],
    guardrails: ["Deduplicates companies", "Raw results are not CRM candidates yet"],
  },
  {
    id: "company_deep_research_agent",
    name: "Company Deep Research Agent",
    layer: "intelligence",
    purpose:
      "Checks operational reality, commercial activity, external validation, and B2B potential before person-level research starts.",
    writesTo: ["companies", "source_links", "relationship_signals", "agent_runs"],
    outputContract: [
      "company_profile",
      "operational_signals",
      "commercial_activity_signals",
      "external_validation_signals",
      "missing_company_data",
    ],
    guardrails: ["Company website claims alone are not proof", "Stores source URLs"],
  },
  {
    id: "decision_maker_finder_agent",
    name: "Decision Maker Finder Agent",
    layer: "intelligence",
    purpose:
      "Finds the founder, owner, partner, CEO, general manager, or best available decision maker from non-LinkedIn sources.",
    writesTo: ["people", "source_links", "relationship_signals", "agent_runs"],
    outputContract: ["person_name", "title", "relation_to_company", "confidence", "status"],
    guardrails: ["Does not delete good companies when person data is missing", "Can return company_good_person_missing"],
  },
  {
    id: "person_deep_research_agent",
    name: "Person Deep Research Agent",
    layer: "intelligence",
    purpose:
      "Researches public visibility, authority, event/chamber/association ties, and network potential for the selected person.",
    writesTo: ["candidate_intelligence_profiles", "source_links", "relationship_signals", "agent_runs"],
    outputContract: ["role_signals", "authority_signals", "network_value_signals", "visibility_signals", "risks"],
    guardrails: ["Ignores LinkedIn results in this workflow", "Flags same-name ambiguity"],
  },
  {
    id: "evidence_confidence_agent",
    name: "Evidence & Confidence Agent",
    layer: "decision",
    purpose:
      "Classifies company and person evidence by source reliability, then generates a data confidence score.",
    writesTo: ["source_links", "relationship_signals", "agent_runs"],
    outputContract: ["source_confidence", "data_confidence_score", "verified_claims", "weak_claims"],
    guardrails: ["Does not present guesses as facts", "Requests manual verification when data is insufficient"],
  },
  {
    id: "e4n_scoring_agent",
    name: "E4N Scoring Agent",
    layer: "decision",
    purpose:
      "Scores company reality, decision maker quality, commercial activity, network potential, E4N fit, visibility, and data confidence.",
    writesTo: ["fit_scores", "agent_runs"],
    outputContract: [
      "company_reality_score",
      "decision_maker_score",
      "commercial_activity_score",
      "network_potential_score",
      "e4n_fit_score",
      "visibility_score",
      "data_confidence_score",
      "action_category",
    ],
    guardrails: ["Treats visibility as a small signal", "Does not penalize quiet business owners by default"],
  },
  {
    id: "candidate_report_generator",
    name: "Candidate Report Generator",
    layer: "action",
    purpose:
      "Creates one Markdown research report and one machine-readable JSON output for each qualified candidate.",
    writesTo: ["candidate_reports", "agent_runs"],
    outputContract: ["candidate_file_name", "markdown_content", "json_content", "sources"],
    guardrails: ["Unsupported claims stay as assumptions or missing data, not facts"],
  },
  {
    id: "outreach_strategy_agent",
    name: "Outreach Strategy Agent",
    layer: "action",
    purpose:
      "Chooses the outreach angle, A1-A10 action category, first-touch draft, and follow-up plan without sending anything.",
    writesTo: ["approach_strategies", "message_drafts", "relationship_moves", "agent_runs"],
    outputContract: ["action_category", "outreach_angle", "first_message", "follow_up_message", "manual_review_needed"],
    guardrails: ["Never sends outbound communication", "Requires human approval for every external action"],
  },
];

export const researchWorkflowSteps = [
  "Generate non-LinkedIn source queries for the target segment",
  "Extract a deduplicated company pool from approved source types",
  "Research company reality and commercial activity deeply",
  "Find the best decision maker or mark company_good_person_missing",
  "Research the selected person through non-LinkedIn public sources",
  "Verify person-company relation and classify all evidence by confidence",
  "Generate E4N score, data confidence score, and action category",
  "Recommend approach strategy and relationship move",
  "Write one candidate report as Markdown plus JSON",
] as const;

export const researchSourceTypes = [
  "fair_exhibitor_lists",
  "events_summits_conferences",
  "chambers_industry_committees",
  "google_maps_local_businesses",
  "sector_company_directories",
  "official_or_semi_official_lists",
  "dealer_distributor_franchise_lists",
  "associations_unions_platforms",
] as const;

export const actionCategories = [
  { id: "A1", label: "Invite now" },
  { id: "A2", label: "Manually verify, then invite" },
  { id: "A3", label: "E4N member candidate" },
  { id: "A4", label: "Sponsor candidate" },
  { id: "A5", label: "Speaker candidate" },
  { id: "A6", label: "White-collar meeting guest" },
  { id: "A7", label: "Partner or association collaboration" },
  { id: "A8", label: "Add to follow-up list" },
  { id: "A9", label: "Not suitable" },
  { id: "A10", label: "Good company, missing person; research decision maker manually" },
] as const;

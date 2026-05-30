export type SearchEngine = "google" | "bing";

export type QueryTemplateType =
  | "open_web_person_discovery"
  | "company_team_page"
  | "event_speaker"
  | "investment_news"
  | "startup_database"
  | "technopark_company"
  | "association_member"
  | "sponsor_candidate"
  | "podcast_interview"
  | "media_visibility"
  | "jury_mentor_advisory"
  | "press_release"
  | "conference_agenda";

export type ResearchSegment = {
  name: string;
  personaType: string;
  targetCategory: string;
  roleKeywords: string[];
  sectorKeywords: string[];
  locationKeywords: string[];
  sourceKeywords: string[];
  sourceHypotheses: string[];
  priority: number;
};

export type SearchQueryPlan = {
  segment: ResearchSegment;
  engine: SearchEngine;
  query: string;
  templateType: QueryTemplateType;
  purposeLabel: string;
  expectedResultType: string;
  extractionTargets: string[];
  qualitySignals: string[];
  lowQualitySignals: string[];
  assignedBot: string;
  wave: 1 | 2 | 3 | 4;
};

export type SourceResultInput = {
  title?: string;
  url: string;
  snippet?: string;
  rank?: number;
  rawHtmlExcerpt?: string;
};

export type ExtractedEntity = {
  entityType: "person" | "company" | "event" | "news" | "podcast" | "association";
  name: string;
  company?: string;
  title?: string;
  sector?: string;
  location?: string;
  profileUrl?: string;
  websiteUrl?: string;
  context: string;
  importanceReason: string;
  e4nPotential: string;
  normalizedKey: string;
};

export type NormalizedProfile = {
  normalizedName: string;
  normalizedCompany: string;
  title?: string;
  category: string;
  summary: string;
  location?: string;
  sector?: string;
  evidenceCount: number;
  entities: ExtractedEntity[];
};

export type ProfileScore = {
  finalScore: number;
  scoreBand: string;
  category: string;
  explanation: string;
  scoreBreakdown: Record<string, number>;
};

export type CommunicationStrategy = {
  firstTouchAngle: string;
  firstMessageDraft: string;
  followUpPlan: string;
  riskNotes: string;
};

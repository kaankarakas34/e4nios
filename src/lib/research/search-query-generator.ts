import type { QueryTemplateType, ResearchSegment, SearchEngine, SearchQueryPlan } from "./types";

type TemplateDefinition = {
  type: QueryTemplateType;
  purposeLabel: string;
  expectedResultType: string;
  build: (segment: ResearchSegment) => string;
};

function first(values: string[], fallback: string) {
  return values[0] ?? fallback;
}

function quote(value: string) {
  return `"${value}"`;
}

const templates: TemplateDefinition[] = [
  {
    type: "open_web_person_discovery",
    purposeLabel: "acik web kisi kesfi",
    expectedResultType: "person_profile_or_public_mention",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "business")), quote(first(segment.roleKeywords, "founder")), quote(first(segment.locationKeywords, "Turkey"))].join(" "),
  },
  {
    type: "company_team_page",
    purposeLabel: "sirket ekip sayfasi kesfi",
    expectedResultType: "company_team_page",
    build: (segment) =>
      `site:.com ${quote("team")} ${quote(first(segment.sectorKeywords, "startup"))} ${quote(first(segment.locationKeywords, "Turkey"))}`,
  },
  {
    type: "event_speaker",
    purposeLabel: "etkinlik konusmacisi kesfi",
    expectedResultType: "event_speaker_page",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "startup")), quote("speaker"), quote(first(segment.roleKeywords, "founder")), quote(first(segment.locationKeywords, "Istanbul"))].join(" "),
  },
  {
    type: "investment_news",
    purposeLabel: "yatirim haberlerinden kisi cikarma",
    expectedResultType: "investment_news",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "startup")), quote("yatirim aldi"), quote(first(segment.roleKeywords, "kurucu")), quote("Turkiye")].join(" "),
  },
  {
    type: "startup_database",
    purposeLabel: "startup veri tabani kesfi",
    expectedResultType: "startup_directory",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "startup")), quote("startup list"), quote(first(segment.locationKeywords, "Turkey"))].join(" "),
  },
  {
    type: "technopark_company",
    purposeLabel: "teknokent firma kesfi",
    expectedResultType: "technopark_company_directory",
    build: (segment) =>
      [quote(first(segment.locationKeywords, "Teknopark Istanbul")), quote(first(segment.sectorKeywords, "fintech")), quote("firma"), quote("kurucu")].join(" "),
  },
  {
    type: "association_member",
    purposeLabel: "dernek ve oda uye kesfi",
    expectedResultType: "association_member_page",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "finans")), quote("dernek"), quote("uyeler"), quote("Turkey")].join(" "),
  },
  {
    type: "sponsor_candidate",
    purposeLabel: "sponsor adayi sirket kesfi",
    expectedResultType: "sponsor_or_corporate_program_page",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "banka")), quote("sponsorluk"), quote("girisimcilik"), quote(first(segment.locationKeywords, "Istanbul"))].join(" "),
  },
  {
    type: "podcast_interview",
    purposeLabel: "podcast ve roportaj kesfi",
    expectedResultType: "podcast_or_interview",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "startup")), quote("podcast"), quote(first(segment.roleKeywords, "founder")), quote("Turkey")].join(" "),
  },
  {
    type: "media_visibility",
    purposeLabel: "basin gorunurlugu kesfi",
    expectedResultType: "media_article",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "fintech")), quote("interview"), quote(first(segment.roleKeywords, "CEO")), quote("Turkey")].join(" "),
  },
  {
    type: "jury_mentor_advisory",
    purposeLabel: "juri mentor danisma kurulu kesfi",
    expectedResultType: "jury_mentor_advisory_page",
    build: (segment) =>
      [quote("demo day"), quote("juri"), quote(first(segment.sectorKeywords, "startup")), quote(first(segment.locationKeywords, "Istanbul"))].join(" "),
  },
  {
    type: "press_release",
    purposeLabel: "basin bulteni ve odul listesi kesfi",
    expectedResultType: "press_release",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "startup")), quote("basin bulteni"), quote(first(segment.roleKeywords, "founder")), quote("Turkiye")].join(" "),
  },
  {
    type: "conference_agenda",
    purposeLabel: "konferans programi kesfi",
    expectedResultType: "conference_agenda",
    build: (segment) =>
      [quote(first(segment.sectorKeywords, "finans")), quote("konferans"), quote("program"), quote(first(segment.roleKeywords, "speaker"))].join(" "),
  },
];

const preferredByPersona: Record<string, QueryTemplateType[]> = {
  investor_decision_maker: ["open_web_person_discovery", "company_team_page", "investment_news", "jury_mentor_advisory"],
  angel_investor: ["open_web_person_discovery", "investment_news", "event_speaker", "jury_mentor_advisory"],
  founder_operator: ["open_web_person_discovery", "company_team_page", "investment_news", "podcast_interview"],
  capital_allocator: ["open_web_person_discovery", "company_team_page", "media_visibility", "conference_agenda"],
  sponsor_decision_maker: ["sponsor_candidate", "media_visibility", "conference_agenda", "open_web_person_discovery"],
  corporate_finance_leader: ["open_web_person_discovery", "event_speaker", "media_visibility", "conference_agenda"],
  ecosystem_builder: ["event_speaker", "jury_mentor_advisory", "startup_database", "conference_agenda"],
  technopark_founder_pool: ["technopark_company", "company_team_page", "startup_database", "open_web_person_discovery"],
};

export function generateSearchQueries(segments: ResearchSegment[], maxQueries = 96): SearchQueryPlan[] {
  const plans: SearchQueryPlan[] = [];
  const engines: SearchEngine[] = ["google", "bing"];

  for (const segment of segments) {
    const templateTypes = preferredByPersona[segment.personaType] ?? [
      "open_web_person_discovery",
      "company_team_page",
      "event_speaker",
      "media_visibility",
    ];

    for (const templateType of templateTypes.slice(0, 4)) {
      const template = templates.find((item) => item.type === templateType);
      if (!template) {
        continue;
      }

      for (const engine of engines) {
        plans.push({
          segment,
          engine,
          query: template.build(segment),
          templateType: template.type,
          purposeLabel: template.purposeLabel,
          expectedResultType: template.expectedResultType,
          extractionTargets: [
            "ad_soyad",
            "sirket",
            "pozisyon",
            "sektor",
            "lokasyon",
            "kaynak_url",
            "neden_onemli",
            "e4n_potansiyel_katki",
          ],
          qualitySignals: [
            "karar verici unvan",
            "sirket ekip sayfasi",
            "yatirim veya medya gorunurlugu",
            "konusmaci juri mentor sinyali",
            "birden fazla guvenilir kaynak",
          ],
          lowQualitySignals: [
            "sadece sosyal medya linki",
            "belirsiz unvan",
            "kaynakta kisi veya sirket dogrulanamiyor",
            "eski ve baglamsiz liste",
          ],
          assignedBot: "SearchResultCollector",
          wave: 1,
        });
      }
    }
  }

  return plans.slice(0, maxQueries);
}

export function buildSearchUrl(engine: SearchEngine, query: string) {
  const encoded = encodeURIComponent(query);
  return engine === "google" ? `https://www.google.com/search?q=${encoded}` : `https://www.bing.com/search?q=${encoded}`;
}

import type { ResearchSegment } from "./types";

const locations = ["Istanbul", "Turkey", "Turkiye", "Maslak", "Levent", "Atasehir", "Ankara", "Izmir"];

const financeStartupSegments: ResearchSegment[] = [
  {
    name: "Venture capital partners",
    personaType: "investor_decision_maker",
    targetCategory: "mentor / yatirimci adayi",
    roleKeywords: ["managing partner", "general partner", "investment director", "venture partner"],
    sectorKeywords: ["venture capital", "VC fund", "startup investment", "growth equity"],
    locationKeywords: locations,
    sourceKeywords: ["team", "portfolio", "investment news", "speaker", "demo day", "jury"],
    sourceHypotheses: [
      "VC firm team pages expose partners and investment directors.",
      "Startup investment news names fund partners and lead investors.",
    ],
    priority: 1,
  },
  {
    name: "Angel investors",
    personaType: "angel_investor",
    targetCategory: "mentor / yatirimci adayi",
    roleKeywords: ["angel investor", "board member", "mentor", "investor"],
    sectorKeywords: ["angel investment", "startup ecosystem", "seed investment"],
    locationKeywords: locations,
    sourceKeywords: ["yatirim yapti", "demo day", "mentor", "juri", "startup event"],
    sourceHypotheses: [
      "Angel investor networks and demo day pages list active investors.",
      "Seed round announcements reveal repeat individual investors.",
    ],
    priority: 1,
  },
  {
    name: "Fintech founders",
    personaType: "founder_operator",
    targetCategory: "uye adayi",
    roleKeywords: ["founder", "co-founder", "CEO", "kurucu"],
    sectorKeywords: ["fintech", "payment systems", "open banking", "wealthtech", "insurtech"],
    locationKeywords: locations,
    sourceKeywords: ["yatirim aldi", "team", "ekibimiz", "kurucumuz", "interview", "podcast"],
    sourceHypotheses: [
      "Fintech market maps and startup news identify founders with commercial traction.",
      "Company team pages confirm founder and CEO roles.",
    ],
    priority: 1,
  },
  {
    name: "Private equity and family office leaders",
    personaType: "capital_allocator",
    targetCategory: "kurumsal davet adayi",
    roleKeywords: ["private equity partner", "family office executive", "portfolio manager", "investment manager"],
    sectorKeywords: ["private equity", "family office", "asset management", "wealth management"],
    locationKeywords: locations,
    sourceKeywords: ["team", "management team", "portfolio", "advisory board", "interview"],
    sourceHypotheses: [
      "Investment firm pages and interviews expose senior capital allocators.",
      "Portfolio and advisory board pages signal decision power.",
    ],
    priority: 2,
  },
  {
    name: "Bank and finance sponsor leaders",
    personaType: "sponsor_decision_maker",
    targetCategory: "sponsor adayi",
    roleKeywords: ["corporate communication director", "business development director", "marketing director", "innovation director"],
    sectorKeywords: ["banking", "commercial banking", "finans", "sponsorship", "payment systems"],
    locationKeywords: locations,
    sourceKeywords: ["sponsorluk", "girisimcilik programi", "event sponsor", "kurumsal iletisim"],
    sourceHypotheses: [
      "Sponsor and entrepreneurship program pages reveal the right corporate functions.",
      "Bank innovation programs indicate SME and founder audience overlap.",
    ],
    priority: 1,
  },
  {
    name: "CFO and finance executives",
    personaType: "corporate_finance_leader",
    targetCategory: "ziyaretci adayi",
    roleKeywords: ["CFO", "finance director", "financial affairs director", "genel mudur yardimcisi"],
    sectorKeywords: ["corporate finance", "finance", "banking", "investment"],
    locationKeywords: locations,
    sourceKeywords: ["speaker", "konusmaci", "interview", "panel", "yonetim kurulu"],
    sourceHypotheses: [
      "Conference agendas and panels expose visible finance executives.",
      "Board and management pages verify seniority.",
    ],
    priority: 3,
  },
  {
    name: "Accelerator and incubation managers",
    personaType: "ecosystem_builder",
    targetCategory: "stratejik partner adayi",
    roleKeywords: ["accelerator manager", "incubation manager", "program director", "innovation manager"],
    sectorKeywords: ["accelerator", "incubator", "girisimcilik merkezi", "startup program"],
    locationKeywords: locations,
    sourceKeywords: ["mentor", "program", "demo day", "juri", "startups"],
    sourceHypotheses: [
      "Accelerator program pages reveal operators who can introduce many founders.",
      "Mentor and jury lists expose network hubs.",
    ],
    priority: 2,
  },
  {
    name: "Technopark fintech companies",
    personaType: "technopark_founder_pool",
    targetCategory: "uye adayi",
    roleKeywords: ["founder", "CEO", "kurucu", "genel mudur"],
    sectorKeywords: ["teknokent", "teknopark", "fintech", "startup"],
    locationKeywords: ["Teknopark Istanbul", "ITU Cekirdek", "Yildiz Teknopark", "Bilisim Vadisi", "Kocaeli", "Istanbul"],
    sourceKeywords: ["firma", "company list", "ekip", "kurucu", "portfolio"],
    sourceHypotheses: [
      "Technopark company directories produce qualified company pools.",
      "Company pages then expose founders and general managers.",
    ],
    priority: 2,
  },
];

const genericSegments: ResearchSegment[] = [
  {
    name: "Founder and CEO operators",
    personaType: "founder_operator",
    targetCategory: "uye adayi",
    roleKeywords: ["founder", "co-founder", "CEO", "general manager", "kurucu"],
    sectorKeywords: ["B2B", "business development", "growth", "entrepreneurship"],
    locationKeywords: locations,
    sourceKeywords: ["team", "speaker", "interview", "press release", "event"],
    sourceHypotheses: ["Open web pages, event pages and interviews reveal visible decision makers."],
    priority: 2,
  },
];

export function generateSegments(prompt: string, maxSegments = 12): ResearchSegment[] {
  const normalized = prompt.toLowerCase();
  const financeIntent =
    normalized.includes("finans") ||
    normalized.includes("venture") ||
    normalized.includes("yatirim") ||
    normalized.includes("investor") ||
    normalized.includes("startup") ||
    normalized.includes("fintech") ||
    normalized.includes("teknokent");

  const segments = financeIntent ? financeStartupSegments : genericSegments;
  return segments.slice(0, Math.max(1, maxSegments));
}

export function interpretForE4N(prompt: string) {
  return [
    "Bu hedef E4N icin nicelik degil nitelik arastirmasidir.",
    "Sistem sirketin ticari gercekligini, karar verici kisiyi, acik web kanitlarini ve davet edilebilirlik sinyallerini birlikte arar.",
    `Kullanici hedefi: ${prompt}`,
  ].join(" ");
}

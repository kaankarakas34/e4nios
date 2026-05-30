import type { NormalizedProfile, ProfileScore } from "./types";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function band(score: number) {
  if (score >= 90) return "cok yuksek oncelik";
  if (score >= 75) return "yuksek kalite";
  if (score >= 60) return "potansiyel aday";
  if (score >= 40) return "dusuk oncelik";
  return "uygun degil";
}

function category(profile: NormalizedProfile) {
  const haystack = `${profile.normalizedName} ${profile.normalizedCompany} ${profile.title ?? ""} ${profile.summary}`.toLowerCase();
  if (haystack.includes("sponsor") || haystack.includes("bank") || haystack.includes("kurumsal")) return "sponsor adayi";
  if (haystack.includes("investor") || haystack.includes("yatirim") || haystack.includes("venture")) return "mentor / yatirimci adayi";
  if (haystack.includes("speaker") || haystack.includes("konusmaci") || haystack.includes("podcast")) return "konusmaci adayi";
  if (haystack.includes("teknopark") || haystack.includes("association") || haystack.includes("dernek")) return "stratejik partner adayi";
  if (haystack.includes("director") || haystack.includes("cfo") || haystack.includes("manager")) return "ziyaretci adayi";
  return profile.category;
}

export function scoreProfile(profile: NormalizedProfile): ProfileScore {
  const haystack = `${profile.normalizedName} ${profile.title ?? ""} ${profile.summary}`.toLowerCase();
  const decisionPower =
    haystack.includes("founder") || haystack.includes("ceo") || haystack.includes("partner") || haystack.includes("kurucu")
      ? 18
      : haystack.includes("director") || haystack.includes("manager") || haystack.includes("cfo")
        ? 14
        : 8;
  const evidenceConfidence = Math.min(14, profile.evidenceCount * 5);
  const ecosystemRelevance =
    haystack.includes("fintech") || haystack.includes("startup") || haystack.includes("venture") || haystack.includes("yatirim")
      ? 14
      : 8;
  const networkValue =
    haystack.includes("mentor") || haystack.includes("speaker") || haystack.includes("juri") || haystack.includes("portfolio")
      ? 14
      : 9;
  const sponsorPotential = haystack.includes("bank") || haystack.includes("sponsor") || haystack.includes("payment") ? 12 : 5;
  const commercialReality = profile.normalizedCompany || profile.evidenceCount > 1 ? 10 : 6;
  const invitationLikelihood = haystack.includes("event") || haystack.includes("podcast") || haystack.includes("interview") ? 8 : 6;
  const referralPotential = haystack.includes("partner") || haystack.includes("mentor") || haystack.includes("founder") ? 8 : 5;
  const speakerPotential = haystack.includes("speaker") || haystack.includes("konusmaci") || haystack.includes("podcast") ? 7 : 3;

  const scoreBreakdown = {
    decision_power: decisionPower,
    commercial_reality: commercialReality,
    network_value: networkValue,
    ecosystem_relevance: ecosystemRelevance,
    evidence_confidence: evidenceConfidence,
    sponsor_potential: sponsorPotential,
    invitation_likelihood: invitationLikelihood,
    referral_potential: referralPotential,
    speaker_potential: speakerPotential,
  };
  const finalScore = clamp(Object.values(scoreBreakdown).reduce((total, item) => total + item, 0));
  const resolvedCategory = category(profile);

  return {
    finalScore,
    scoreBand: band(finalScore),
    category: resolvedCategory,
    scoreBreakdown,
    explanation: `${profile.normalizedName} ${resolvedCategory} olarak siniflandi. Skor; karar gucu, kanit sayisi, finans/startup ekosistemi ilgisi, network degeri ve davet edilebilirlik sinyallerinden uretildi.`,
  };
}

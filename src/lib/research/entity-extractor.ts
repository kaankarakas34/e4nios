import type { ExtractedEntity, SourceResultInput } from "./types";

const seniorTitles = [
  "founder",
  "co-founder",
  "ceo",
  "cfo",
  "partner",
  "director",
  "general manager",
  "kurucu",
  "genel mudur",
  "yatirimci",
  "investor",
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inferEntityType(result: SourceResultInput): ExtractedEntity["entityType"] {
  const haystack = `${result.title ?? ""} ${result.snippet ?? ""} ${result.url}`.toLowerCase();
  if (haystack.includes("podcast")) return "podcast";
  if (haystack.includes("event") || haystack.includes("konferans") || haystack.includes("demo day")) return "event";
  if (haystack.includes("dernek") || haystack.includes("association") || haystack.includes("chamber")) return "association";
  if (haystack.includes("yatirim") || haystack.includes("investment") || haystack.includes("haber")) return "news";
  if (seniorTitles.some((title) => haystack.includes(title))) return "person";
  return "company";
}

function inferName(result: SourceResultInput) {
  const title = result.title?.split(/[|-]/)[0]?.trim();
  const fromTitle = title && title.length > 2 ? title : new URL(result.url).hostname.replace(/^www\./, "");
  return fromTitle.slice(0, 120);
}

function inferTitle(result: SourceResultInput) {
  const haystack = `${result.title ?? ""} ${result.snippet ?? ""}`.toLowerCase();
  return seniorTitles.find((title) => haystack.includes(title));
}

export function extractEntityFromSource(result: SourceResultInput): ExtractedEntity {
  const entityType = inferEntityType(result);
  const name = inferName(result);
  const context = [result.title, result.snippet].filter(Boolean).join(" - ");
  const title = inferTitle(result);
  const url = result.url;

  return {
    entityType,
    name,
    title,
    profileUrl: url,
    websiteUrl: entityType === "company" ? url : undefined,
    context,
    importanceReason:
      entityType === "person"
        ? "Kaynak metin karar verici veya profesyonel gorunurluk sinyali tasiyor."
        : "Kaynak sirket, etkinlik, haber veya kurum uzerinden aday havuzu uretebilir.",
    e4nPotential:
      entityType === "person"
        ? "E4N icin davet edilebilir kisi veya iliski merkezi olabilir."
        : "E4N icin yeni kisi, sponsor veya partner adaylari uretmekte kullanilabilir.",
    normalizedKey: normalize(`${name} ${title ?? ""}`),
  };
}

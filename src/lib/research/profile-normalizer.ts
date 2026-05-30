import type { ExtractedEntity, NormalizedProfile } from "./types";

function keyFor(entity: ExtractedEntity) {
  return `${entity.normalizedKey || entity.name.toLowerCase()}::${(entity.company ?? "").toLowerCase()}`;
}

export function normalizeProfiles(entities: ExtractedEntity[]): NormalizedProfile[] {
  const grouped = new Map<string, ExtractedEntity[]>();

  for (const entity of entities) {
    const key = keyFor(entity);
    grouped.set(key, [...(grouped.get(key) ?? []), entity]);
  }

  return [...grouped.values()].map((items) => {
    const primary = items[0];
    const company = primary.company ?? "";

    return {
      normalizedName: primary.name,
      normalizedCompany: company,
      title: primary.title,
      category: primary.entityType === "company" ? "kurumsal davet adayi" : "uye adayi",
      summary: `${primary.name} icin ${items.length} acik web kaniti bulundu. ${primary.e4nPotential}`,
      location: primary.location,
      sector: primary.sector,
      evidenceCount: items.length,
      entities: items,
    };
  });
}

import { describe, expect, it } from "vitest";

import { buildStrategicFallbackPlan } from "./orchestrator";

describe("research orchestrator planning", () => {
  it("decomposes finance and startup ecosystem missions into targeted search lanes", () => {
    const mission =
      "finans profesyonellerini, yatırımcıları, girişimcileri, venture capital ekiplerini, melek yatırımcıları, fon yöneticilerini, fintech kurucularını ve startup ekosistemindeki karar vericileri araştır";

    const plan = buildStrategicFallbackPlan(mission, 8);

    expect(plan.search_strategy.target_personas).toContain("venture capital ekipleri");
    expect(plan.search_strategy.target_organization_types).toContain("VC fonları");
    expect(plan.source_tasks.some((task) => task.source_type === "venture_capital_portfolios")).toBe(true);
    expect(plan.source_tasks.some((task) => task.query.includes("venture capital"))).toBe(true);
    expect(plan.source_tasks.every((task) => task.query !== mission)).toBe(true);
  });
});

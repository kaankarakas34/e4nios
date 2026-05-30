import { NextResponse } from "next/server";

import { createResearchCampaign } from "@/lib/research/research-orchestrator";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResearchCampaignDashboard, listResearchCampaigns } from "@/lib/supabase/queries";

export async function GET() {
  const campaigns = await listResearchCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const maxResults = typeof body.maxResults === "number" ? body.maxResults : 100;

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const result = await createResearchCampaign(supabase, { prompt, maxResults });
  const dashboard = await getResearchCampaignDashboard(String(result.campaign.id));

  return NextResponse.json({ ...result, dashboard }, { status: 201 });
}

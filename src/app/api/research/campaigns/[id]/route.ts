import { NextResponse } from "next/server";

import { getResearchCampaignDashboard } from "@/lib/supabase/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dashboard = await getResearchCampaignDashboard(id);

  if (!dashboard?.campaign) {
    return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  }

  return NextResponse.json(dashboard);
}

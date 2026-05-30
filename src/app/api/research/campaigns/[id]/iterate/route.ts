import { NextResponse } from "next/server";

import { createResearchIteration } from "@/lib/research/research-orchestrator";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 500 });
  }

  const { id } = await params;
  const result = await createResearchIteration(supabase, id);

  return NextResponse.json(result);
}

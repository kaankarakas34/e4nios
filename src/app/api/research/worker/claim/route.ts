import { NextResponse } from "next/server";

import { buildSearchUrl } from "@/lib/research/search-query-generator";
import { createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized worker" }, { status: 401 });
}

export async function POST(request: Request) {
  const workerToken = process.env.RESEARCH_WORKER_TOKEN;
  if (workerToken && request.headers.get("x-worker-token") !== workerToken) {
    return unauthorized();
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const workerId = typeof body.workerId === "string" ? body.workerId : "local-playwright-worker";

  const { data: task, error } = await supabase
    .from("research_tasks")
    .select("*")
    .eq("status", "pending")
    .lt("retry_count", 2)
    .not("engine", "is", null)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!task) {
    return NextResponse.json({ task: null });
  }

  const { data: claimed, error: claimError } = await supabase
    .from("research_tasks")
    .update({
      status: "running",
      worker_id: workerId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", task.id)
    .select("*")
    .single();

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  return NextResponse.json({
    task: {
      id: claimed.id,
      campaignId: claimed.campaign_id,
      segmentId: claimed.segment_id,
      searchQueryId: claimed.search_query_id,
      engine: claimed.engine,
      query: claimed.query,
      searchUrl: buildSearchUrl(claimed.engine, claimed.query),
      retryCount: claimed.retry_count,
      maxRetries: claimed.max_retries,
      safety: {
        loginAllowed: false,
        captchaBypassAllowed: false,
        maxBrowserContexts: 1,
        jitterSeconds: [20, 45],
      },
    },
  });
}

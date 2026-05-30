import { NextResponse } from "next/server";

import { recordWorkerResults } from "@/lib/research/research-orchestrator";
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
  const taskId = typeof body.taskId === "string" ? body.taskId : "";

  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  const result = await recordWorkerResults(supabase, {
    taskId,
    workerId: typeof body.workerId === "string" ? body.workerId : undefined,
    status: body.status === "blocked" || body.status === "failed" ? body.status : "completed",
    blockedReason: typeof body.blockedReason === "string" ? body.blockedReason : undefined,
    results: Array.isArray(body.results) ? body.results : [],
  });

  return NextResponse.json(result);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  LINKEDIN_STATE_COOKIE,
} from "@/lib/linkedin/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(LINKEDIN_STATE_COOKIE)?.value;

  cookieStore.delete(LINKEDIN_STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(new URL(`/settings?linkedin=error&reason=${error}`, url.origin));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/settings?linkedin=invalid_state", url.origin));
  }

  try {
    const token = await exchangeLinkedInCode(code);
    const profile = await fetchLinkedInUserInfo(token.access_token);
    const supabase = createAdminClient();

    if (supabase) {
      await supabase.from("linkedin_accounts").upsert(
        {
          linkedin_sub: profile.sub,
          name: profile.name ?? null,
          email: profile.email ?? null,
          picture_url: profile.picture ?? null,
          locale: profile.locale ?? null,
          raw_profile: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "linkedin_sub" },
      );
    }

    return NextResponse.redirect(new URL("/settings?linkedin=connected", url.origin));
  } catch (callbackError) {
    console.error(callbackError);
    return NextResponse.redirect(new URL("/settings?linkedin=failed", url.origin));
  }
}

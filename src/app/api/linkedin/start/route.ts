import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createLinkedInAuthorizationUrl,
  createLinkedInState,
  LINKEDIN_STATE_COOKIE,
} from "@/lib/linkedin/oauth";

export async function GET() {
  const state = createLinkedInState();
  const cookieStore = await cookies();

  cookieStore.set(LINKEDIN_STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.redirect(createLinkedInAuthorizationUrl(state));
}

import { randomBytes } from "crypto";

export const LINKEDIN_STATE_COOKIE = "e4n_linkedin_oauth_state";

export function linkedinEnv() {
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri:
      process.env.LINKEDIN_REDIRECT_URI ??
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/linkedin/callback`,
  };
}

export function createLinkedInState() {
  return randomBytes(24).toString("hex");
}

export function createLinkedInAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = linkedinEnv();

  if (!clientId) {
    throw new Error("LINKEDIN_CLIENT_ID is not configured.");
  }

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);

  return url;
}

export async function exchangeLinkedInCode(code: string) {
  const { clientId, clientSecret, redirectUri } = linkedinEnv();

  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn OAuth credentials are not configured.");
  }

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`LinkedIn token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    expires_in: number;
    id_token?: string;
    scope?: string;
    token_type: string;
  }>;
}

export async function fetchLinkedInUserInfo(accessToken: string) {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`LinkedIn userinfo fetch failed: ${response.status}`);
  }

  return response.json() as Promise<{
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
    locale?: string;
  }>;
}

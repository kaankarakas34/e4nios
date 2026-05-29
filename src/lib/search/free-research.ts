export type FreeSourceResult = {
  title: string;
  url: string;
  snippet: string;
  source: "direct_public_url";
};

function searchUrl(baseUrl: string, query: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("q", query);
  return url.toString();
}

export function buildGoogleSearchUrl(query: string) {
  return searchUrl("https://www.google.com/search", query);
}

export function buildDuckDuckGoSearchUrl(query: string) {
  return searchUrl("https://duckduckgo.com/", query);
}

export function parseSourceUrls(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return new URL(line).toString();
      } catch {
        return null;
      }
    })
    .filter((url): url is string => Boolean(url))
    .slice(0, 20);
}

function pageTitle(html: string, fallbackUrl: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match?.[1]?.replace(/\s+/g, " ").trim();
  return title || fallbackUrl;
}

function pageSnippet(html: string) {
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];
  if (description) {
    return description.replace(/\s+/g, " ").trim().slice(0, 500);
  }

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

export async function fetchPublicSource(url: string): Promise<FreeSourceResult> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "E4NRelationshipBrain/1.0 (+https://e4nios.vercel.app)",
    },
  });

  if (!response.ok) {
    throw new Error(`Public source fetch failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  return {
    title: contentType.includes("html") ? pageTitle(body, url) : url,
    url,
    snippet: contentType.includes("html") ? pageSnippet(body) : body.slice(0, 500),
    source: "direct_public_url",
  };
}

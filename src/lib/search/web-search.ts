export type WebSearchResult = {
  title: string;
  url: string;
  snippet?: string;
  source: "serpapi_google" | "brave_search";
};

type SerpApiOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
};

type BraveResult = {
  title?: string;
  url?: string;
  description?: string;
};

function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function buildGoogleSearchUrl(query: string) {
  return googleSearchUrl(query);
}

export function hasWebSearchProvider() {
  return Boolean(process.env.SERPAPI_API_KEY || process.env.BRAVE_SEARCH_API_KEY);
}

export async function searchWeb(query: string, limit = 5): Promise<WebSearchResult[]> {
  if (process.env.SERPAPI_API_KEY) {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", process.env.SERPAPI_API_KEY);
    url.searchParams.set("num", String(limit));

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`SerpAPI search failed: ${response.status}`);
    }

    const payload = (await response.json()) as { organic_results?: SerpApiOrganicResult[] };
    return (payload.organic_results ?? [])
      .filter((item) => item.title && item.link)
      .slice(0, limit)
      .map((item) => ({
        title: item.title ?? "",
        url: item.link ?? "",
        snippet: item.snippet,
        source: "serpapi_google" as const,
      }));
  }

  if (process.env.BRAVE_SEARCH_API_KEY) {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(limit));

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`Brave Search failed: ${response.status}`);
    }

    const payload = (await response.json()) as { web?: { results?: BraveResult[] } };
    return (payload.web?.results ?? [])
      .filter((item) => item.title && item.url)
      .slice(0, limit)
      .map((item) => ({
        title: item.title ?? "",
        url: item.url ?? "",
        snippet: item.description,
        source: "brave_search" as const,
      }));
  }

  return [];
}

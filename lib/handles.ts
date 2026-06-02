export type PlatformStatus = "available" | "taken" | "unknown";

export type PlatformResult = {
  id: string;
  name: string;
  url: string;
  status: PlatformStatus;
  note?: string;
};

export type HandleSearchResult = {
  handle: string;
  platforms: PlatformResult[];
  availableCount: number;
  takenCount: number;
  aiSummary: string;
  suggestedBidUsd: number;
  searchedAt: string;
};

const HANDLE_RE = /^[a-z0-9_]{3,15}$/;

export function normalizeHandle(raw: string): string | null {
  const trimmed = raw.trim().replace(/^@+/, "").toLowerCase();
  if (!HANDLE_RE.test(trimmed)) return null;
  return trimmed;
}

const PLATFORMS = [
  { id: "x", name: "X", buildUrl: (h: string) => `https://x.com/${h}` },
  { id: "instagram", name: "Instagram", buildUrl: (h: string) => `https://www.instagram.com/${h}/` },
  { id: "tiktok", name: "TikTok", buildUrl: (h: string) => `https://www.tiktok.com/@${h}` },
  { id: "youtube", name: "YouTube", buildUrl: (h: string) => `https://www.youtube.com/@${h}` },
  { id: "github", name: "GitHub", buildUrl: (h: string) => `https://github.com/${h}` },
  { id: "twitch", name: "Twitch", buildUrl: (h: string) => `https://www.twitch.tv/${h}` },
] as const;

async function probeGitHub(handle: string): Promise<PlatformStatus> {
  try {
    const res = await fetch(`https://api.github.com/users/${handle}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "AttaboyzHandleChecker/1.0" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (res.status === 404) return "available";
    if (res.ok) return "taken";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function probeHtml(
  url: string,
  takenMarkers: string[],
  availableMarkers: string[],
): Promise<PlatformStatus> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AttaboyzHandleChecker/1.0)" },
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
      redirect: "follow",
    });
    const html = (await res.text()).toLowerCase();
    if (availableMarkers.some((m) => html.includes(m))) return "available";
    if (takenMarkers.some((m) => html.includes(m))) return "taken";
    if (res.status === 404) return "available";
    if (res.ok) return "unknown";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function probePlatform(
  platform: (typeof PLATFORMS)[number],
  handle: string,
): Promise<PlatformResult> {
  const url = platform.buildUrl(handle);

  if (platform.id === "github") {
    const status = await probeGitHub(handle);
    return { id: platform.id, name: platform.name, url, status };
  }

  const markers: Record<string, { taken: string[]; available: string[] }> = {
    x: {
      taken: ['"screen_name"', "profile_images", "followers_count"],
      available: ["this account doesn", "account suspended", "page doesn"],
    },
    instagram: {
      taken: ["edge_followed_by", "profile_pic_url", "username"],
      available: ["sorry, this page isn't available", "page not found"],
    },
    tiktok: {
      taken: ["uniqueid", "followercount", "nickname"],
      available: ["couldn't find this account", "couldn\\u0027t find this account"],
    },
    youtube: {
      taken: ["channelid", "externalid", "subscribercount"],
      available: ["channel does not exist", "this page isn't available"],
    },
    twitch: {
      taken: ["displayname", "followercount", "broadcaster_type"],
      available: ["sorry. unless you've got a time machine"],
    },
  };

  const m = markers[platform.id];
  const status = m ? await probeHtml(url, m.taken, m.available) : "unknown";
  return { id: platform.id, name: platform.name, url, status };
}

function buildAiSummary(handle: string, platforms: PlatformResult[]): string {
  const available = platforms.filter((p) => p.status === "available");
  const taken = platforms.filter((p) => p.status === "taken");
  const unknown = platforms.filter((p) => p.status === "unknown");

  if (available.length === platforms.length) {
    return `@${handle} looks wide open across every network we scanned — a strong candidate for immediate registration or a marketplace bid.`;
  }
  if (taken.length === platforms.length) {
    return `@${handle} is claimed on all checked platforms. Consider variations, suffixes, or placing a competitive bid if a handle becomes transferable.`;
  }
  if (available.length > 0 && taken.length > 0) {
    return `@${handle} is partially available (${available.map((p) => p.name).join(", ")}). Secure open lanes now and bid on the rest through ATTABOY marketplace.`;
  }
  if (unknown.length > 0) {
    return `@${handle} returned mixed signals — ${available.length} open, ${taken.length} taken, ${unknown.length} inconclusive. Our AI scan recommends acting fast on confirmed openings.`;
  }
  return `@${handle} scan complete. Review platform rows below and place a bid on any lane you want ATTABOY to pursue.`;
}

async function fetchTavilyIntel(handle: string): Promise<string | null> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query: `"@${handle}" OR "${handle}" username social media profile site:x.com OR site:instagram.com OR site:tiktok.com`,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { answer?: string };
    return typeof data.answer === "string" && data.answer.trim() ? data.answer.trim() : null;
  } catch {
    return null;
  }
}

export async function searchHandle(raw: string): Promise<HandleSearchResult | { error: string }> {
  const handle = normalizeHandle(raw);
  if (!handle) {
    return { error: "Enter a valid @ name (3–15 letters, numbers, or underscores)." };
  }

  const platforms = await Promise.all(PLATFORMS.map((p) => probePlatform(p, handle)));
  const availableCount = platforms.filter((p) => p.status === "available").length;
  const takenCount = platforms.filter((p) => p.status === "taken").length;

  let aiSummary = buildAiSummary(handle, platforms);
  const tavilyAnswer = await fetchTavilyIntel(handle);
  if (tavilyAnswer) {
    aiSummary = `${aiSummary} Web intel: ${tavilyAnswer}`;
  }

  const suggestedBidUsd =
    availableCount >= 4 ? 49 : availableCount >= 2 ? 99 : availableCount === 1 ? 149 : 199;

  return {
    handle,
    platforms,
    availableCount,
    takenCount,
    aiSummary,
    suggestedBidUsd,
    searchedAt: new Date().toISOString(),
  };
}

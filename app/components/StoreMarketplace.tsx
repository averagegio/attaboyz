"use client";

import { useCallback, useEffect, useState } from "react";
import type { HandleSearchResult, PlatformResult } from "@/lib/handles";
import { MIN_BID_USD } from "@/lib/pricing";

type StoreMarketplaceProps = {
  initialHandle?: string;
  showCanceled?: boolean;
};

function StatusBadge({ status }: { status: PlatformResult["status"] }) {
  const styles = {
    available: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    taken: "border-rose-400/40 bg-rose-500/15 text-rose-200",
    unknown: "border-white/15 bg-white/5 text-white/60",
  } as const;

  const labels = {
    available: "Available",
    taken: "Taken",
    unknown: "Unknown",
  } as const;

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function StoreMarketplace({ initialHandle = "", showCanceled = false }: StoreMarketplaceProps) {
  const [query, setQuery] = useState(initialHandle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HandleSearchResult | null>(null);
  const [bidAmount, setBidAmount] = useState(MIN_BID_USD);
  const [bidEmail, setBidEmail] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const runSearch = useCallback(async (raw: string) => {
    const cleaned = raw.trim().replace(/^@+/, "");
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setBidError(null);

    try {
      const res = await fetch("/api/handles/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: cleaned }),
      });
      const data = (await res.json()) as HandleSearchResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Search failed.");
        setResult(null);
        return;
      }
      setResult(data);
      setBidAmount(data.suggestedBidUsd);
    } catch {
      setError("Network error. Try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialHandle) {
      setQuery(initialHandle);
      void runSearch(initialHandle);
    }
  }, [initialHandle, runSearch]);

  async function onSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runSearch(query);
  }

  async function placeBid(platform: string) {
    if (!result) return;
    setBidError(null);
    setBidLoading(true);
    try {
      const res = await fetch("/api/handles/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: result.handle,
          amountUsd: bidAmount,
          email: bidEmail || undefined,
          platform,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setBidError(data.error ?? "Could not start bid checkout.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setBidError("Network error starting checkout.");
    } finally {
      setBidLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-20 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/85">@ Name Marketplace</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search, claim, and bid on @ names</h1>
        <p className="max-w-2xl text-base leading-relaxed text-white/65">
          AI scans the open web and major social platforms to see if your @ name is available — then lets you bid to
          secure it, GoDaddy-style.
        </p>
      </header>

      {showCanceled ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Bid checkout canceled — no charge. Adjust your offer and try again.
        </div>
      ) : null}

      <form onSubmit={onSearchSubmit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_-30px_rgba(0,240,255,0.25)] sm:p-6">
        <label htmlFor="store-search" className="mb-2 block text-sm font-semibold text-white/80">
          Search @ name availability
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-cyan-300">@</span>
            <input
              id="store-search"
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\s/g, ""))}
              placeholder="coolbrand"
              spellCheck={false}
              className="min-h-12 w-full rounded-2xl border border-white/15 bg-black/40 py-3 pl-9 pr-4 text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="attaboy-cta min-h-12 rounded-2xl px-8 text-sm font-bold disabled:opacity-60"
          >
            {loading ? "Scanning…" : "AI Search"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </form>

      {result ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">@{result.handle}</h2>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                {result.availableCount} open · {result.takenCount} taken
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">{result.aiSummary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {result.platforms.map((platform) => (
              <article
                key={platform.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div>
                  <p className="font-semibold">{platform.name}</p>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-300/80 hover:underline"
                  >
                    View profile lane
                  </a>
                </div>
                <StatusBadge status={platform.status} />
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-fuchsia-400/25 bg-fuchsia-500/5 p-5 sm:p-6">
            <h3 className="text-lg font-semibold">Place a marketplace bid</h3>
            <p className="mt-2 text-sm text-white/65">
              Secure @{result.handle} across social — ATTABOY pursues acquisition on your behalf after checkout.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label htmlFor="bid-amount" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  Bid (USD)
                </label>
                <input
                  id="bid-amount"
                  type="number"
                  min={MIN_BID_USD}
                  step={1}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="min-h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-white outline-none focus:border-fuchsia-300/40"
                />
              </div>
              <div>
                <label htmlFor="bid-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  Contact email (optional)
                </label>
                <input
                  id="bid-email"
                  type="email"
                  value={bidEmail}
                  onChange={(e) => setBidEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="min-h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-white outline-none focus:border-fuchsia-300/40"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={bidLoading}
                  onClick={() => placeBid("all")}
                  className="attaboy-cta min-h-11 w-full rounded-xl px-6 text-sm font-bold disabled:opacity-60 sm:w-auto"
                >
                  {bidLoading ? "Redirecting…" : "Bid with Stripe"}
                </button>
              </div>
            </div>
            {bidError ? <p className="mt-3 text-sm text-rose-300">{bidError}</p> : null}
            <p className="mt-3 text-xs text-white/45">Minimum bid ${MIN_BID_USD}. Suggested ${result.suggestedBidUsd} based on availability.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

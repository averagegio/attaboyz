"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CONSULTING_PLAN } from "@/lib/pricing";

export function ConsultingCard() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/consulting", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        router.push(`/auth?next=${encodeURIComponent(pathname || "/pricing")}`);
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="pricing-card pricing-card--highlight relative flex flex-col rounded-3xl p-6 sm:p-8">
      <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-3 py-1 text-xs font-bold text-black">
        Full build
      </p>
      <h2 className="text-xl font-semibold text-white">{CONSULTING_PLAN.name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{CONSULTING_PLAN.blurb}</p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent">
          {CONSULTING_PLAN.price}
        </span>
        <span className="text-sm text-white/50">{CONSULTING_PLAN.cadence}</span>
      </p>
      <ul className="mt-6 max-h-64 flex-1 space-y-2 overflow-y-auto text-sm text-white/80 sm:max-h-none">
        {CONSULTING_PLAN.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="shrink-0 text-[var(--attaboy-cyan)]" aria-hidden>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={startCheckout}
        className="attaboy-cta mt-8 w-full rounded-2xl px-4 py-3 text-sm font-bold disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Book consulting — Stripe"}
      </button>
    </article>
  );
}

"use client";

import { useState } from "react";
import { ATTABOY_PLANS } from "@/lib/pricing";
import type { SubscriptionTier } from "@/lib/stripe-server";

export function PricingCards() {
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(tier: SubscriptionTier) {
    setError(null);
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, ...(email.trim() ? { email: email.trim() } : {}) }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Could not start checkout. Add Stripe keys or try again.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network error. Check your connection and retry.");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div>
      <div className="mb-8 max-w-md">
        <label htmlFor="checkout-email" className="mb-2 block text-sm font-semibold text-white/70">
          Checkout email (optional)
        </label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className="min-h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-white outline-none focus:border-cyan-300/40"
        />
      </div>

      {error ? (
        <p className="mb-8 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {ATTABOY_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={[
              "pricing-card relative flex flex-col rounded-3xl p-6 sm:p-8",
              plan.highlight ? "pricing-card--highlight lg:-translate-y-1" : "",
            ].join(" ")}
          >
            {plan.highlight ? (
              <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-3 py-1 text-xs font-bold text-black">
                Most popular
              </p>
            ) : null}
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{plan.blurb}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent">
                {plan.price}
              </span>
              <span className="text-sm text-white/50">{plan.cadence}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-white/80">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-[var(--attaboy-cyan)]" aria-hidden>
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={loadingTier !== null}
              onClick={() => startCheckout(plan.id)}
              className={[
                "mt-8 w-full rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                plan.highlight
                  ? "attaboy-cta"
                  : "border border-[color-mix(in_srgb,var(--attaboy-cyan)_35%,transparent)] bg-black text-white hover:border-[var(--attaboy-magenta)] hover:shadow-[0_0_20px_rgba(255,0,170,0.2)]",
              ].join(" ")}
            >
              {loadingTier === plan.id ? "Redirecting…" : "Subscribe with Stripe"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

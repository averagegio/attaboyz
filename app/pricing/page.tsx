import type { Metadata } from "next";
import Link from "next/link";
import { PricingCards } from "@/app/components/PricingCards";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Pricing | ATTABOY",
  description: "Subscribe to ATTABOY handle scouting, marketplace bids, and brand command plans.",
};

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

export default async function PricingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const showCanceled = sp.canceled === "1";

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-20 sm:px-6">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/85">Plans</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pick your lane</h1>
          <p className="text-base leading-relaxed text-white/65">
            Subscribe with Stripe Checkout — from handle scouting to full brand command with custom AI builds.
          </p>
        </header>

        {showCanceled ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Checkout canceled — no charge. Choose a plan when you&apos;re ready.
          </div>
        ) : null}

        <PricingCards />

        <p className="text-center text-sm text-white/45">
          Need a one-off @ bid instead?{" "}
          <Link href="/store" className="font-semibold text-cyan-300 hover:underline">
            Search the marketplace
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

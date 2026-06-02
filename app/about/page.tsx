import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "About | ATTABOY",
  description: "ATTABOY Website Building Inc. — secure sites, AI agents, and @ name marketplace.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-20 sm:px-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/85">About ATTABOY</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Secure a new world of AI</h1>
        </header>

        <div className="space-y-5 text-base leading-relaxed text-white/70">
          <p>
            ATTABOY Website Building Inc. builds full-stack experiences for founders who care about brand, speed, and
            security. From cinematic landing pages to AI-powered marketplaces, we ship production-grade work — not
            templates.
          </p>
          <p>
            Our @ Name Store scans the open web and major social platforms so you can see what&apos;s available before
            someone else grabs it. When a handle matters, you can bid through Stripe and let ATTABOY pursue acquisition
            on your behalf.
          </p>
          <p>
            Whether you need a single hero launch, ongoing handle monitoring, or an enterprise agent stack, we combine
            design, engineering, and payments into one lane.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/store" className="attaboy-cta inline-flex rounded-full px-6 py-3 text-sm font-bold">
            Browse @ store
          </Link>
          <Link
            href="/pricing"
            className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

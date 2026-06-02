import Link from "next/link";
import { FloatingNav } from "@/app/components/SiteHeader";
import { LandingIntroHero } from "@/app/components/LandingIntroHero";

export default function Home() {
  return (
    <main className="relative">
      <FloatingNav />
      <LandingIntroHero />

      {/* Scroll runway: intro fades while content moves up into view */}
      <div className="relative z-10 min-h-dvh bg-[#030712]" aria-hidden />

      <section
        id="about"
        className="relative z-10 border-t border-white/10 bg-[#030712] px-4 py-20 sm:px-8"
      >
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/85">About</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Website building for the AI era
            </h2>
            <p className="text-base leading-relaxed text-white/65">
              ATTABOY ships cinematic sites, secure infrastructure, and an @ name marketplace where you can search
              availability across social platforms and bid to secure your brand.
            </p>
            <Link href="/about" className="attaboy-cta inline-flex rounded-full px-5 py-2.5 text-sm font-bold">
              Learn more
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <ul className="space-y-4 text-sm text-white/75">
              <li className="flex gap-3">
                <span className="text-cyan-300">→</span>
                AI-powered @ name search across X, Instagram, TikTok, and more
              </li>
              <li className="flex gap-3">
                <span className="text-fuchsia-300">→</span>
                Marketplace bids processed through Stripe Checkout
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-300">→</span>
                Custom sites and agent integrations for growing teams
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="store"
        className="relative z-10 border-t border-white/10 bg-[#030712] px-4 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/85">Marketplace</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Claim your @ name before someone else does
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            Enter any handle — our store API scans the web and shows what&apos;s open. Bid instantly when you find the
            one you want.
          </p>
          <Link href="/store" className="attaboy-cta mt-8 inline-flex rounded-full px-8 py-3 text-sm font-bold">
            Open @ store
          </Link>
        </div>
      </section>
    </main>
  );
}

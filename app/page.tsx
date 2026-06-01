import { FloatingNav } from "@/app/components/FloatingNav";
import { LandingIntroHero } from "@/app/components/LandingIntroHero";

export default function Home() {
  return (
    <main className="relative">
      <FloatingNav />
      <LandingIntroHero />

      {/* Scroll runway: intro fades while content moves up into view */}
      <div className="relative z-10 min-h-dvh bg-[#030712]" aria-hidden />

      <section
        id="services"
        className="relative z-10 border-t border-white/10 bg-[#030712] px-4 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Build what&apos;s next
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            Custom websites, AI integrations, and secure deployments — engineered for teams
            ready to move fast without cutting corners.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { HeroSignupForm } from "@/app/components/HeroSignupForm";
import { LANDING_INTRO_FADE_DISTANCE_PX } from "@/lib/landing-hero";

/**
 * Full-bleed opening: edge-to-edge hero video, headline, signup form. Fades on scroll.
 */
export function LandingIntroHero() {
  const [fade, setFade] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setFade(Math.min(1, Math.max(0, window.scrollY / LANDING_INTRO_FADE_DISTANCE_PX)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      /* autoplay may be blocked until interaction */
    });
  }, []);

  const opacity = 1 - fade;
  const hidden = opacity < 0.04;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[25] overflow-hidden"
      style={{
        opacity,
        visibility: hidden ? "hidden" : "visible",
        transform: `translateY(${fade * -24}px)`,
      }}
      aria-hidden={hidden}
    >
      <div className="absolute inset-0 bg-[#030712]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/attaboyinc1-transparent.png"
        >
          <source src="/attbyzwrld.mp4" type="video/mp4" />
        </video>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,7,18,0.72) 0%, rgba(3,7,18,0.18) 34%, rgba(3,7,18,0.35) 62%, rgba(3,7,18,0.92) 100%)",
        }}
        aria-hidden
      />

      <div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent"
        aria-hidden
      />

      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
        aria-hidden
      />

      <div className="pointer-events-auto absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-28 pt-24 text-center sm:px-6 sm:pb-24 sm:pt-28">
        <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-fuchsia-300/85 sm:text-xs">
          ATTABOY Website Building Inc.
        </p>

        <h1 className="landing-intro-title max-w-4xl bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent [text-shadow:none]">
          Secure a new world of ai
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
          Full-stack sites, agents, and secure infrastructure for the next generation of the web.
        </p>

        <HeroSignupForm />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HamburgerButton } from "@/app/components/HamburgerButton";
import { LogoHomeLink } from "@/app/components/LogoHomeLink";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/auth", label: "Log in" },
];

type SiteHeaderProps = {
  variant?: "hero" | "solid";
};

const heroNavLink =
  "rounded-lg px-3 py-2 text-sm font-semibold text-white/90 outline-none transition [text-shadow:0_2px_12px_rgba(0,0,0,0.65)] group-hover/header:text-white group-hover/header:[text-shadow:none] group-hover/header:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-300/60";

const solidNavLink =
  "rounded-lg px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300/60";

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const isHero = variant === "hero";

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const header = (
    <header className={`fixed left-0 right-0 top-0 z-50 ${isHero ? "pt-3 sm:pt-4" : "border-b border-white/10 bg-[#030712]/90 pt-3 backdrop-blur-md sm:pt-4"}`}>
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div
          className={[
            "group/header flex min-h-[3.75rem] items-center justify-between gap-3 rounded-2xl border px-2 py-1 transition-all duration-300 sm:px-3",
            isHero
              ? menuOpen
                ? "border-white/15 bg-black/55 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)]"
                : "border-transparent bg-transparent hover:border-white/10 hover:bg-black/25"
              : "border-white/10 bg-black/40 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)]",
          ].join(" ")}
        >
          <LogoHomeLink
            imageClassName={[
              "h-12 w-auto max-w-[min(280px,62vw)] object-contain object-left sm:h-14",
              isHero ? "drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]" : "",
            ].join(" ")}
          />

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={isHero ? heroNavLink : solidNavLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center md:hidden">
            <HamburgerButton open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />
          </div>
        </div>
      </div>

      <div
        className={[
          "mx-auto max-w-6xl overflow-hidden px-3 transition-[max-height,opacity,margin] duration-300 sm:px-6 md:hidden",
          menuOpen ? "mt-2 max-h-[28rem] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav className="rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );

  return portalEl ? createPortal(header, portalEl) : null;
}

export function FloatingNav() {
  return <SiteHeader variant="hero" />;
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader variant="solid" />
      <div className="min-h-screen bg-[#030712] pt-24 text-white">{children}</div>
    </>
  );
}

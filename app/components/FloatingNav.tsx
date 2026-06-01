"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HamburgerButton } from "@/app/components/HamburgerButton";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const heroNavLink =
  "rounded-lg px-3 py-2 text-sm font-semibold text-white/90 outline-none transition [text-shadow:0_2px_12px_rgba(0,0,0,0.65)] group-hover/header:text-white group-hover/header:[text-shadow:none] group-hover/header:hover:bg-white/10 group-focus-within/header:text-white group-focus-within/header:[text-shadow:none] focus-visible:ring-2 focus-visible:ring-cyan-300/60";

export function FloatingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

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
    <header className="fixed left-0 right-0 top-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div
          className={[
            "group/header flex min-h-[3.75rem] items-center justify-between gap-3 rounded-2xl border px-2 py-1 shadow-none backdrop-blur-[2px] transition-all duration-300 ease-out sm:px-3",
            menuOpen
              ? "border-white/15 bg-black/55 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)]"
              : "border-transparent bg-transparent hover:border-white/10 hover:bg-black/25 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] focus-within:border-white/10 focus-within:bg-black/25",
          ].join(" ")}
        >
          <Link href="/" className="flex shrink-0 items-center py-1 pl-1">
            <Image
              src="/attaboyinc2-transparent.png"
              alt="ATTABOY Website Building Inc."
              width={220}
              height={88}
              priority
              className="h-10 w-auto max-w-[min(220px,58vw)] object-contain object-left drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:h-11"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">{navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={heroNavLink}>
              {link.label}
            </Link>
          ))}</nav>

          <div className="flex items-center md:hidden">
            <HamburgerButton open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />
          </div>
        </div>
      </div>

      <div
        className={[
          "mx-auto max-w-6xl overflow-hidden px-3 transition-[max-height,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 md:hidden",
          menuOpen ? "mt-2 max-h-80 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav className="rounded-2xl border border-white/10 bg-black/60 p-2 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.85)] backdrop-blur-xl">
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
